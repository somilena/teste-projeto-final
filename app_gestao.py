from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import sqlite3
import os
from datetime import datetime
from permissoes import verificar_permissao, obter_secoes_permitidas, listar_niveis_disponiveis, NIVEIS, normalizar_nivel
try:
    import psycopg2
    import psycopg2.extras
except Exception:
    psycopg2 = None

# Configurações do App
app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.environ.get('GESTAO_SECRET_KEY', 'segredo_sga_cumaru_2025') # Defina GESTAO_SECRET_KEY em produção

# Configuração de Upload de Arquivos
UPLOAD_FOLDER = 'static/uploads/contratos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Função para conectar ao banco
def get_db():
    """Conexão DB com suporte a Postgres via DATABASE_URL e fallback SQLite."""
    db_url = os.environ.get('DATABASE_URL')
    if db_url and psycopg2:
        class _PGConn:
            def __init__(self, url):
                self._conn = psycopg2.connect(url)
                self._conn.autocommit = False
            def _convert_sql(self, sql):
                sql = sql.replace("date('now')", "CURRENT_DATE")
                out = []
                for ch in sql:
                    out.append('%s' if ch == '?' else ch)
                return ''.join(out)
            def cursor(self):
                return self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            def execute(self, sql, params=tuple()):
                cur = self.cursor()
                cur.execute(self._convert_sql(sql), params or tuple())
                return cur
            def commit(self):
                self._conn.commit()
            def close(self):
                self._conn.close()
        return _PGConn(db_url)
    conn = sqlite3.connect("db_prodcumaru.db")
    conn.row_factory = sqlite3.Row
    return conn

# ==========================================
# 0. AUTENTICAÇÃO STAFF
# ==========================================

# Health-check simples para verificar disponibilidade do servidor
@app.route("/health")
def health():
    try:
        conn = get_db()
        conn.execute("SELECT 1")
        conn.close()
        return jsonify({"status": "ok", "db": True}), 200
    except Exception:
        return jsonify({"status": "error", "db": False}), 500

@app.route("/login-staff")
def login_staff():
    # Página de login do staff
    return render_template("login/login-staff.html")

@app.route("/api/login-staff", methods=['POST'])
def api_login_staff():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    
    conn = get_db()
    staff = conn.execute(
        "SELECT * FROM tb_funcionarios WHERE email = ? AND senha_aces = ? AND status = 'Ativo'",
        (email, senha)
    ).fetchone()
    conn.close()
    
    if staff:
        session['staff_id'] = staff['id_funcionarios']
        session['staff_nome'] = staff['nome']
        session['staff_email'] = staff['email']
        # Garante string para nivel na sessão
        session['staff_nivel'] = str(staff['nivel_aces'])
        
        return jsonify({
            'success': True,
            'user': {
                'id': staff['id_funcionarios'],
                'nome': staff['nome'],
                'email': staff['email'],
                'nivel': staff['nivel_aces']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Credenciais inválidas'}), 401

@app.route("/api/logout-staff", methods=['POST'])
def api_logout_staff():
    session.clear()
    return jsonify({'success': True})

def row_to_dict(row):
    """Converte sqlite3.Row em dicionário"""
    if row is None:
        return None

    # ==========================================
    # 1. ENDPOINTS DE LISTAGEM (RBAC)
    # ==========================================

    def require_staff():
        if not session.get('staff_id'):
            return False
        return True

    @app.route("/api/gestao/clientes")
    def api_list_clientes():
        if not require_staff():
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        nivel = session.get('staff_nivel')
        conn = get_db()
        try:
            # Admin vê tudo; outros níveis podem ver ambos para leitura
            clientes_f = conn.execute("SELECT id_clientes_fisico, nome, email, tel_cel, data_cad FROM tb_clientes_fisico ORDER BY id_clientes_fisico DESC").fetchall()
            clientes_j = conn.execute("SELECT id_clientes_juridicos, razao_social, email, tel_cel, data_cad FROM tb_clientes_juridicos ORDER BY id_clientes_juridicos DESC").fetchall()
            return jsonify({
                'success': True,
                'fisicos': [dict(r) for r in clientes_f],
                'juridicos': [dict(r) for r in clientes_j],
                'nivel': nivel
            })
        finally:
            conn.close()

    @app.route("/api/gestao/financas")
    def api_list_financas():
        if not require_staff():
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        nivel = session.get('staff_nivel')
        # Exemplo de RBAC simples: contabilidade (5) e admin (1) veem tudo; demais apenas leitura básica
        conn = get_db()
        try:
            fin = conn.execute("SELECT id_financas, tipo, nome, cliente_ass, data_emissao, data_vencimento, valor_total, status FROM tb_financas ORDER BY id_financas DESC").fetchall()
            return jsonify({
                'success': True,
                'financas': [dict(r) for r in fin],
                'nivel': nivel
            })
        finally:
            conn.close()

    @app.route("/api/gestao/agendamentos")
    def api_list_agendamentos():
        if not require_staff():
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        nivel = session.get('staff_nivel')
        conn = get_db()
        try:
            ag = conn.execute("SELECT id_reg_agendamentos, id_cliente, nome, email, tel_cel, horario, data_agend, servico, status FROM tb_reg_agendamentos ORDER BY id_reg_agendamentos DESC").fetchall()
            return jsonify({
                'success': True,
                'agendamentos': [dict(r) for r in ag],
                'nivel': nivel
            })
        finally:
            conn.close()

    @app.route("/api/gestao/funcionarios", methods=['GET'])
    def api_list_funcionarios_gestao():
        if not require_staff():
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        # RBAC: somente 'adm' e 'rh' podem ver listagem completa; outros níveis veem básicos
        nivel = session.get('staff_nivel')
        conn = get_db()
        try:
            cols = "id_funcionarios, nome, email, tel_cel, cargo, nivel_aces, status, data_admis"
            if nivel in ['adm', 'rh']:
                rows = conn.execute(f"SELECT {cols} FROM tb_funcionarios ORDER BY id_funcionarios DESC").fetchall()
            else:
                rows = conn.execute(f"SELECT {cols} FROM tb_funcionarios WHERE status='Ativo' ORDER BY id_funcionarios DESC").fetchall()
            return jsonify({'success': True, 'funcionarios': [dict(r) for r in rows], 'nivel': nivel})
        finally:
            conn.close()

    @app.route("/api/gestao/funcionarios", methods=['POST'])
    def api_create_funcionario_gestao():
        if not require_staff():
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        # RBAC: somente 'adm' e 'rh' podem criar
        if session.get('staff_nivel') not in ['adm', 'rh']:
            return jsonify({'success': False, 'message': 'Sem permissão'}), 403
        data = request.get_json() or {}
        nome = data.get('nome')
        cpf = data.get('cpf')
        email = data.get('email')
        tel = data.get('tel_cel', data.get('telefone'))
        cargo = data.get('cargo')
        senha = data.get('senha_aces', data.get('senha')) or ''
        data_admis = data.get('data_admis', datetime.now().strftime('%Y-%m-%d'))
        log_aces = data.get('log_aces', 'web')
        nivel = data.get('nivel_aces', 'editor')
        status = data.get('status', 'Ativo')
        # Validações básicas
        if not nome or not email or not cargo:
            return jsonify({'success': False, 'message': 'Nome, email e cargo são obrigatórios'}), 400
        conn = get_db()
        try:
            # Duplicidade de email/cpf
            dup_email = conn.execute("SELECT 1 FROM tb_funcionarios WHERE email = ?", (email,)).fetchone()
            if dup_email:
                return jsonify({'success': False, 'message': 'Email já cadastrado'}), 400
            if cpf:
                dup_cpf = conn.execute("SELECT 1 FROM tb_funcionarios WHERE cpf = ?", (cpf,)).fetchone()
                if dup_cpf:
                    return jsonify({'success': False, 'message': 'CPF já cadastrado'}), 400
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO tb_funcionarios (nome, cpf, email, tel_cel, cargo, senha_aces, data_admis, log_aces, nivel_aces, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (nome, cpf, email, tel, cargo, senha, data_admis, log_aces, nivel, status)
            )
            conn.commit()
            new_id = cur.lastrowid
            return jsonify({'success': True, 'id': new_id})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            conn.close()

    @app.route("/api/gestao/agendamentos", methods=['POST'])
    def api_create_agendamento_gestao():
        if not session.get('staff_id'):
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        # RBAC: 'adm' e 'editor' e 'rh' podem criar agendamentos (conforme política)
        if session.get('staff_nivel') not in ['adm', 'editor', 'rh']:
            return jsonify({'success': False, 'message': 'Sem permissão'}), 403
        data = request.get_json() or {}
        cliente_id = data.get('cliente_id')
        servico = data.get('servico')
        data_agend = data.get('data')
        horario = data.get('horario', '00:00')
        if not cliente_id or not servico or not data_agend:
            return jsonify({'success': False, 'message': 'cliente_id, servico e data são obrigatórios'}), 400
        try:
            datetime.strptime(data_agend, '%Y-%m-%d')
        except Exception:
            return jsonify({'success': False, 'message': 'Formato de data inválido (YYYY-MM-DD)'}), 400

        conn = get_db()
        try:
            # Busca dados do cliente (PF ou PJ)
            pf = conn.execute("SELECT id_clientes_fisico as id, nome, email, tel_cel, 'PF' as tipo FROM tb_clientes_fisico WHERE id_clientes_fisico = ?", (cliente_id,)).fetchone()
            cli = pf
            if not pf:
                pj = conn.execute("SELECT id_clientes_juridicos as id, razao_social as nome, email, tel_cel, 'PJ' as tipo FROM tb_clientes_juridicos WHERE id_clientes_juridicos = ?", (cliente_id,)).fetchone()
                cli = pj
            if not cli:
                conn.close()
                return jsonify({'success': False, 'message': 'Cliente não encontrado'}), 404

            # Conflito básico
            conflito = conn.execute("SELECT 1 FROM tb_reg_agendamentos WHERE id_cliente = ? AND data_agend = ? AND horario = ?", (cliente_id, data_agend, horario)).fetchone()
            if conflito:
                conn.close()
                return jsonify({'success': False, 'message': 'Conflito: já existe agendamento nesse horário'}), 409

            conn.execute(
                """
                INSERT INTO tb_reg_agendamentos (id_cliente, nome, email, tel_cel, horario, data_agend, tipo_cliente, servico, status, obs, valor_total, forma_pagamento, status_pagamento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Agendado', ?, ?, ?, 'Pendente')
                """,
                (cli['id'], cli['nome'], cli['email'], cli['tel_cel'], horario, data_agend, cli['tipo'], servico, data.get('obs', ''), float(data.get('valor', 0.0)), data.get('forma_pagamento', 'N/A'))
            )
            conn.commit()
            new_id = conn.execute("SELECT lastval()").fetchone()[0]
            conn.close()
            return jsonify({'success': True, 'id': new_id})
        except Exception as e:
            conn.close()
            return jsonify({'success': False, 'message': str(e)}), 500
    return dict(zip(row.keys(), row))

def rows_to_dicts(rows):
    """Converte lista de sqlite3.Row em lista de dicionários"""
    return [row_to_dict(row) for row in rows]

# ==========================================
# 1. ROTA PRINCIPAL (DASHBOARD)
# ==========================================
@app.route("/gestao")
def dashboard():
    # Verifica se está logado
    if 'staff_id' not in session:
        return redirect(url_for('login_staff'))
    
    # Obtém nível de acesso do usuário e normaliza (converte número para string)
    nivel_raw = session.get('staff_nivel', 1)
    nivel_usuario = normalizar_nivel(nivel_raw)
    permissoes = obter_secoes_permitidas(nivel_usuario)
    # Garante que admin tenha todas as permissões
    if nivel_usuario == 'adm':
        permissoes = ['dashboard','receitas','despesas','agendamentos','pedidos','clientes','contratos','funcionarios','editar_site']
    print(f"[DEBUG] staff_id={session.get('staff_id')} staff_email={session.get('staff_email')} staff_nivel_raw={nivel_raw} -> nivel_usuario={nivel_usuario} permissoes={permissoes}")
    
    conn = get_db()
    cur = conn.cursor()

    # --- CARREGA APENAS OS DADOS QUE O USUÁRIO TEM PERMISSÃO DE VER ---
    
    # Inicializa variáveis
    total_agendamentos = 0
    total_clientes = 0
    faturamento = 0.0
    receitas = []
    despesas = []
    funcionarios = []
    contratos = []
    agendamentos = []
    pedidos = []
    lista_clientes = []
    
    try:
        # Dashboard - Dados gerais
        if 'dashboard' in permissoes:
            total_agendamentos = cur.execute("SELECT COUNT(*) FROM tb_reg_agendamentos").fetchone()[0]
            total_pf = cur.execute("SELECT COUNT(*) FROM tb_clientes_fisico").fetchone()[0]
            total_pj = cur.execute("SELECT COUNT(*) FROM tb_clientes_juridicos").fetchone()[0]
            total_clientes = total_pf + total_pj
            faturamento = cur.execute("SELECT SUM(valor_total) FROM tb_financas WHERE tipo='Receita'").fetchone()[0] or 0.0
        
        # Receitas
        if 'receitas' in permissoes:
            receitas = rows_to_dicts(cur.execute("SELECT * FROM tb_financas WHERE tipo='Receita' ORDER BY data_emissao DESC").fetchall())
        
        # Despesas
        if 'despesas' in permissoes:
            despesas = rows_to_dicts(cur.execute("SELECT * FROM tb_financas WHERE tipo='Despesa' ORDER BY data_emissao DESC").fetchall())
        
        # Funcionários (apenas RH e ADM)
        if 'funcionarios' in permissoes:
            funcionarios = rows_to_dicts(cur.execute("SELECT * FROM tb_funcionarios").fetchall())
        
        # Contratos - Filtra conforme o nível
        if 'contratos' in permissoes:
            if nivel_usuario == 'rh':
                # RH vê apenas contratos de funcionários
                funcionarios_nomes = [f['nome'] for f in funcionarios]
                contratos = rows_to_dicts(cur.execute("SELECT * FROM tb_contratos WHERE cliente_ass IN (" + ",".join(["?"] * len(funcionarios_nomes)) + ")", funcionarios_nomes).fetchall())
            elif nivel_usuario == 'juridico':
                # Jurídico vê apenas contratos de clientes (não de funcionários)
                contratos = rows_to_dicts(cur.execute("SELECT * FROM tb_contratos WHERE cliente_ass NOT IN (SELECT nome FROM tb_funcionarios)").fetchall())
            else:
                # ADM vê todos
                contratos = rows_to_dicts(cur.execute("SELECT * FROM tb_contratos").fetchall())
        
        # Agendamentos
        if 'agendamentos' in permissoes:
            agendamentos = rows_to_dicts(cur.execute("SELECT * FROM tb_reg_agendamentos ORDER BY data_agend DESC").fetchall())
        
        # Pedidos
        if 'pedidos' in permissoes:
            pedidos = rows_to_dicts(cur.execute("SELECT * FROM tb_pedido ORDER BY data_pedido DESC").fetchall())
        
        # Clientes
        if 'clientes' in permissoes:
            pfs = rows_to_dicts(cur.execute("SELECT id_clientes_fisico as id, nome, email, tel_cel, 'PF' as tipo, cpf as doc FROM tb_clientes_fisico").fetchall())
            pjs = rows_to_dicts(cur.execute("SELECT id_clientes_juridicos as id, razao_social as nome, email, tel_cel, 'PJ' as tipo, cnpj as doc FROM tb_clientes_juridicos").fetchall())
            lista_clientes.extend(pfs)
            lista_clientes.extend(pjs)
    
    except Exception as e:
        print(f"Erro ao carregar dados: {e}")

    conn.close()

    # Envia tudo para o HTML
    return render_template("gestao/gestao.html",
                           total_agendamentos=total_agendamentos,
                           total_clientes=total_clientes,
                           faturamento=faturamento,
                           receitas=receitas,
                           despesas=despesas,
                           funcionarios=funcionarios,
                           contratos=contratos,
                           agendamentos=agendamentos,
                           pedidos=pedidos,
                           clientes=lista_clientes,
                           nivel_usuario=nivel_usuario,
                           permissoes=permissoes,
                           niveis_disponiveis=listar_niveis_disponiveis())

# ==========================================
# 2. ROTAS DE CADASTRO (AÇÕES DOS FORMULÁRIOS)
# ==========================================

# --- SALVAR NOVA RECEITA ---
@app.route("/gestao/receita/nova", methods=['POST'])
def nova_receita():
    conn = get_db()
    conn.execute("""
        INSERT INTO tb_financas (tipo, nome, cliente_ass, valor_total, data_emissao, data_vencimento, obs, status)
        VALUES ('Receita', ?, ?, ?, ?, ?, ?, 'Pago')
    """, (
        request.form['origem'],       # name="origem"
        request.form['cliente'],      # name="cliente"
        request.form['valor'],        # name="valor"
        request.form['data_emissao'], # name="data_emissao"
        request.form.get('data_agendada', ''), # name="data_agendada"
        request.form.get('obs', '')   # name="obs"
    ))
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# --- EXCLUIR RECEITA ---
@app.route("/gestao/receita/excluir/<int:id>", methods=['POST', 'DELETE'])
def excluir_receita(id):
    conn = get_db()
    conn.execute("DELETE FROM tb_financas WHERE id_financas = ? AND tipo = 'Receita'", (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# --- SALVAR NOVA DESPESA ---
@app.route("/gestao/despesa/nova", methods=['POST'])
def nova_despesa():
    conn = get_db()
    conn.execute("""
        INSERT INTO tb_financas (tipo, nome, valor_total, data_emissao, data_vencimento, status, obs)
        VALUES ('Despesa', ?, ?, ?, ?, ?, ?)
    """, (
        request.form['nome'],            # name="nome"
        request.form['valor'],           # name="valor"
        request.form['data_emissao'],    # name="data_emissao"
        request.form['data_vencimento'], # name="data_vencimento"
        request.form['status'],          # name="status"
        request.form.get('obs', '')      # name="obs"
    ))
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# --- EXCLUIR DESPESA ---
@app.route("/gestao/despesa/excluir/<int:id>", methods=['POST', 'DELETE'])
def excluir_despesa(id):
    conn = get_db()
    conn.execute("DELETE FROM tb_financas WHERE id_financas = ? AND tipo = 'Despesa'", (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# --- SALVAR NOVO FUNCIONÁRIO ---
@app.route("/gestao/funcionario/novo", methods=['POST'])
def novo_funcionario():
    conn = get_db()
    nivel = request.form.get('nivel', 'editor')  # Padrão: editor
    
    conn.execute("""
        INSERT INTO tb_funcionarios (nome, cpf, email, tel_cel, cargo, senha_aces, data_admis, log_aces, nivel_aces, status)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, ?, ?, 'Ativo')
    """, (
        request.form['nome'],     # name="nome"
        request.form['cpf'],      # name="cpf"
        request.form['email'],    # name="email"
        request.form.get('tel_cel', request.form.get('telefone')), # name="tel_cel" or fallback to telefone
        request.form['cargo'],    # name="cargo"
        request.form['senha'],    # name="senha"
        request.form['email'],    # Usa o email como login
        nivel                     # Nível de acesso (adm, editor, rh, juridico, contabilidade)
    ))
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# --- SALVAR NOVO AGENDAMENTO ---
@app.route("/gestao/agendamento/novo", methods=['POST'])
def novo_agendamento():
    conn = get_db()
    cliente_id = request.form.get('cliente')
    if not cliente_id:
        flash("Cliente deve ser selecionado", "error")
        return redirect(url_for('dashboard'))

    # Buscar dados do cliente selecionado
    cliente = None
    pf = conn.execute("SELECT id_clientes_fisico as id, nome, email, tel_cel, 'PF' as tipo FROM tb_clientes_fisico WHERE id_clientes_fisico = ?", (cliente_id,)).fetchone()
    if pf:
        cliente = pf
    else:
        pj = conn.execute("SELECT id_clientes_juridicos as id, razao_social as nome, email, tel_cel, 'PJ' as tipo FROM tb_clientes_juridicos WHERE id_clientes_juridicos = ?", (cliente_id,)).fetchone()
        if pj:
            cliente = pj

    if not cliente:
        flash("Cliente não encontrado", "error")
        return redirect(url_for('dashboard'))

    # Inserir agendamento com dados do cliente
    conn.execute("""
        INSERT INTO tb_reg_agendamentos (id_cliente, nome, data_agend, servico, obs, valor_total, status, tipo_cliente, email, tel_cel, horario, forma_pagamento, status_pagamento)
        VALUES (?, ?, ?, ?, ?, 0.0, 'Agendado', ?, ?, ?, '00:00', 'N/A', 'Pendente')
    """, (
        cliente_id,
        cliente['nome'],  # Nome do cliente
        request.form['data'],   # name="data"
        request.form['tipo'],   # name="tipo" (serviço)
        request.form.get('obs', ''), # name="obs"
        cliente['tipo'],  # Tipo do cliente (PF/PJ)
        cliente['email'],
        cliente['tel_cel']
    ))
    conn.commit()
    conn.close()
    flash("Agendamento criado com sucesso", "success")
    return redirect(url_for('dashboard'))

# --- SALVAR NOVO CONTRATO (UPLOAD) ---
@app.route("/gestao/contrato/novo", methods=['POST'])
def novo_contrato():
    file = request.files['arquivo'] # name="arquivo"
    
    if file:
        filename = f"{datetime.now().timestamp()}_{file.filename}" # Nome único
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        conn = get_db()
        conn.execute("INSERT INTO tb_contratos (cliente_ass, titulo_doc, arquivo) VALUES (?, ?, ?)",
                     (request.form['cliente'], request.form['titulo'], filename))
        conn.commit()
        conn.close()
        
    return redirect(url_for('dashboard'))

# ==========================================
# 3. ROTAS AUXILIARES
# ==========================================

# Rota para abrir a página de cadastro de cliente (nova aba)
@app.route("/gestao/cadastro-cliente")
def pagina_cadastro_cliente():
    # Verifica se está logado
    if 'staff_id' not in session:
        return redirect(url_for('login_staff'))
    return render_template("gestao/cadastro-cliente.html")

# Rota para salvar o cliente (vinda da página cadastro-cliente.html)
@app.route("/gestao/cliente/salvar", methods=['POST'])
def salvar_cliente_externo():
    tipo = request.form.get('tipo-pessoa') # 'pf' ou 'pj'
    conn = get_db()
    
    if tipo == 'pf':
        conn.execute("""
            INSERT INTO tb_clientes_fisico (nome, cpf, data_nasc, email, tel_cel, cep, logradouro, numero, bairro, cidade, estado, senha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            request.form['nome'], request.form['cpf'], request.form['nascimento'],
            request.form['email'], request.form['telefone'], request.form['cep'],
            request.form['logradouro'], request.form['numero'], request.form['bairro'],
            request.form['cidade'], request.form['estado'], request.form['senha']
        ))
    else:
        conn.execute("""
            INSERT INTO tb_clientes_juridicos (razao_social, cnpj, email, tel_cel, cep, logradouro, numero, bairro, cidade, estado, senha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            request.form['razao_social'], request.form['cnpj'],
            request.form['email'], request.form['telefone'], request.form['cep'],
            request.form['logradouro'], request.form['numero'], request.form['bairro'],
            request.form['cidade'], request.form['estado'], request.form['senha']
        ))
        
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# ==========================================
# 4. ENDPOINTS AJAX (PARA OPERAÇÕES AJAX DO DASHBOARD)
# ==========================================

# --- GET FUNCIONÁRIOS (JSON) ---
@app.route("/api/funcionarios", methods=['GET'])
def api_get_funcionarios():
    conn = get_db()
    cur = conn.cursor()
    funcionarios = cur.execute("SELECT * FROM tb_funcionarios").fetchall()
    conn.close()
    return jsonify({"success": True, "funcionarios": [dict(func) for func in funcionarios]})


# --- CREATE FUNCIONÁRIO (JSON) ---
@app.route("/api/funcionarios", methods=['POST'])
def api_create_funcionario():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Nenhum dado recebido"}), 400

    nome = data.get('nome')
    cpf = data.get('cpf')
    email = data.get('email')
    tel = data.get('tel_cel', data.get('telefone'))
    cargo = data.get('cargo')
    senha = data.get('senha_aces', data.get('senha')) or ''
    data_admis = data.get('data_admis', datetime.now().strftime('%Y-%m-%d'))
    log_aces = data.get('log_aces', 'web')
    nivel = str(data.get('nivel_aces', '1'))
    status = data.get('status', 'Ativo')

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO tb_funcionarios (nome, cpf, email, tel_cel, cargo, senha_aces, data_admis, log_aces, nivel_aces, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (nome, cpf, email, tel, cargo, senha, data_admis, log_aces, nivel, status))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"status": "success", "id": new_id})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- DELETE FUNCIONÁRIO ---
@app.route("/api/funcionarios/<int:func_id>", methods=['DELETE'])
def api_delete_funcionario(func_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM tb_funcionarios WHERE id_funcionarios = ?", (func_id,))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Funcionário deletado"}
    except Exception as e:
        conn.close()
        return {"status": "error", "message": str(e)}, 500

# --- UPDATE FUNCIONÁRIO ---
@app.route("/api/funcionarios/<int:func_id>", methods=['PUT'])
def api_update_funcionario(func_id):
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute("""
            UPDATE tb_funcionarios 
            SET nome=?, cpf=?, email=?, tel_cel=?, cargo=?
            WHERE id_funcionarios = ?
        """, (data['nome'], data['cpf'], data['email'], data.get('tel_cel', data.get('telefone')), data['cargo'], func_id))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Funcionário atualizado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- GET CLIENTES (JSON) ---
@app.route("/api/clientes", methods=['GET'])
def api_get_clientes():
    conn = get_db()
    cur = conn.cursor()
    
    lista_clientes = []
    pfs = cur.execute("SELECT id_clientes_fisico as id, nome, email, tel_cel, 'PF' as tipo, cpf as doc FROM tb_clientes_fisico").fetchall()
    pjs = cur.execute("SELECT id_clientes_juridicos as id, razao_social as nome, email, tel_cel, 'PJ' as tipo, cnpj as doc FROM tb_clientes_juridicos").fetchall()
    
    for pf in pfs:
        lista_clientes.append(dict(pf))
    for pj in pjs:
        lista_clientes.append(dict(pj))
    
    conn.close()
    return jsonify(lista_clientes)

# --- UPDATE CLIENTE ---
@app.route("/api/clientes/<int:cli_id>", methods=['PUT'])
def api_update_cliente(cli_id):
    data = request.get_json()
    tipo = data.get('tipo')
    conn = get_db()
    
    try:
        if tipo == 'PF':
            # Atualiza dados de Pessoa Física, incluindo data de nascimento (data_nasc)
            conn.execute("""
                UPDATE tb_clientes_fisico 
                SET nome=?, email=?, tel_cel=?, cep=?, logradouro=?, numero=?, bairro=?, cidade=?, estado=?, data_nasc=?
                WHERE id_clientes_fisico = ?
            """, (data['nome'], data['email'], data.get('tel_cel', data.get('telefone')), data['cep'], data['logradouro'], 
                  data['numero'], data['bairro'], data['cidade'], data['uf'], data.get('nascimento', ''), cli_id))
        else:
            conn.execute("""
                UPDATE tb_clientes_juridicos 
                SET razao_social=?, email=?, tel_cel=?, cep=?, logradouro=?, numero=?, bairro=?, cidade=?, estado=?
                WHERE id_clientes_juridicos = ?
            """, (data['razao'], data['email'], data.get('tel_cel', data.get('telefone')), data['cep'], data['logradouro'], 
                  data['numero'], data['bairro'], data['cidade'], data['uf'], cli_id))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Cliente atualizado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- DELETE CLIENTE ---
@app.route("/api/clientes/<int:cli_id>", methods=['DELETE'])
def api_delete_cliente(cli_id):
    data = request.get_json()
    tipo = data.get('tipo')
    conn = get_db()
    
    try:
        if tipo == 'PF':
            conn.execute("DELETE FROM tb_clientes_fisico WHERE id_clientes_fisico = ?", (cli_id,))
        else:
            conn.execute("DELETE FROM tb_clientes_juridicos WHERE id_clientes_juridicos = ?", (cli_id,))
        
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Cliente deletado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- GET RECEITAS/DESPESAS (JSON) ---
@app.route("/api/financas/<tipo>", methods=['GET'])
def api_get_financas(tipo):
    conn = get_db()
    cur = conn.cursor()
    financas = cur.execute("SELECT * FROM tb_financas WHERE tipo = ? ORDER BY data_emissao DESC", (tipo,)).fetchall()
    conn.close()
    return jsonify([dict(fin) for fin in financas])

# --- DELETE RECEITA/DESPESA ---
@app.route("/api/financas/<int:fin_id>", methods=['DELETE'])
def api_delete_financa(fin_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM tb_financas WHERE id_financas = ?", (fin_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Item financeiro deletado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- GET AGENDAMENTOS (JSON) ---
@app.route("/api/agendamentos", methods=['GET'])
def api_get_agendamentos():
    conn = get_db()
    cur = conn.cursor()
    agendamentos = cur.execute("SELECT * FROM tb_reg_agendamentos ORDER BY data_agend DESC").fetchall()
    conn.close()
    return jsonify({"success": True, "agendamentos": [dict(ag) for ag in agendamentos]})

# --- DELETE AGENDAMENTO ---
@app.route("/api/agendamentos/<int:ag_id>", methods=['DELETE'])
def api_delete_agendamento(ag_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM tb_reg_agendamentos WHERE id_reg_agendamentos = ?", (ag_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Agendamento deletado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- GET CONTRATOS (JSON) ---
@app.route("/api/contratos", methods=['GET'])
def api_get_contratos():
    conn = get_db()
    cur = conn.cursor()
    contratos = cur.execute("SELECT * FROM tb_contratos").fetchall()
    conn.close()
    return jsonify([dict(cont) for cont in contratos])

# --- DELETE CONTRATO ---
@app.route("/api/contratos/<int:cont_id>", methods=['DELETE'])
def api_delete_contrato(cont_id):
    conn = get_db()
    try:
        conn.execute("DELETE FROM tb_contratos WHERE id_contratos = ?", (cont_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Contrato deletado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# --- GET PEDIDOS (JSON) ---
@app.route("/api/pedidos", methods=['GET'])
def api_get_pedidos():
    conn = get_db()
    cur = conn.cursor()
    pedidos = cur.execute("SELECT * FROM tb_pedido ORDER BY data_pedido DESC").fetchall()
    conn.close()
    return jsonify([dict(ped) for ped in pedidos])

# --- GET ITENS DO PEDIDO (JSON) ---
@app.route("/api/pedidos/<int:pedido_id>/itens", methods=['GET'])
def api_get_itens_pedido(pedido_id):
    conn = get_db()
    cur = conn.cursor()
    itens = cur.execute("""
        SELECT ip.*, p.nome_produto 
        FROM tb_itens_pedido ip
        LEFT JOIN tb_produto p ON ip.id_produto = p.id_produto
        WHERE ip.id_pedido = ?
    """, (pedido_id,)).fetchall()
    conn.close()
    return jsonify([dict(item) for item in itens])

# --- DELETE PEDIDO ---
@app.route("/api/pedidos/<int:pedido_id>", methods=['DELETE'])
def api_delete_pedido(pedido_id):
    conn = get_db()
    try:
        # Deleta itens do pedido primeiro
        conn.execute("DELETE FROM tb_itens_pedido WHERE id_pedido = ?", (pedido_id,))
        # Deleta o pedido
        conn.execute("DELETE FROM tb_pedido WHERE id_pedido = ?", (pedido_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Pedido deletado"})
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# Inicialização
if __name__ == "__main__":
    # Roda na porta 5002 para não conflitar com o site principal (5000) e evitar conflitos locais
    app.run(debug=False, port=5001)