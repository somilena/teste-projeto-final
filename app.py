from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import os
import sqlite3
import sys
import traceback
from datetime import datetime

# App precisa existir antes dos decorators
app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'prodcumaru_secret_key_2025')  # Em produção defina FLASK_SECRET_KEY
def normalize_date(date_str: str):
    if not date_str:
        return None
    try:
        # formatos: 'DD/MM/YYYY', 'DD/MM/YYYY às HH:MM', 'YYYY-MM-DD'
        if 'às' in date_str:
            date_part = date_str.split('às')[0].strip()
        else:
            date_part = date_str.strip()
        if '-' in date_part and len(date_part) == 10:
            return date_part
        d, m, y = date_part.split('/')
        return f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    except Exception:
        return None
@app.route('/api/agendamentos/criar', methods=['POST'])
def api_criar_agendamento_publico():
    try:
        data = request.get_json(force=True) or {}
        conn = get_db(); cur = conn.cursor()
        data_agend_iso = normalize_date(data.get('data_agend'))
        cur.execute(
            """
            INSERT INTO tb_reg_agendamentos
            (id_cliente, nome, email, tel_cel, horario, data_agend, tipo_cliente, servico, status, obs, valor_total, forma_pagamento, status_pagamento)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id_reg_agendamentos
            """,
            (
                data.get('id_cliente') or 0,
                data.get('nome'),
                data.get('email'),
                data.get('tel_cel'),
                data.get('horario'),
                data_agend_iso,
                data.get('tipo_cliente') or 'fisico',
                data.get('servico'),
                data.get('status') or 'Pendente',
                data.get('obs'),
                float(data.get('valor_total') or 0),
                data.get('forma_pagamento') or 'pix',
                data.get('status_pagamento') or 'Aguardando',
            )
        )
        ag_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'ok': True, 'id': ag_id})
    except Exception as e:
        print('ERRO AGENDAMENTO PUBLICO:', e)
        print(traceback.format_exc())
        return jsonify({'ok': False, 'error': 'Falha ao criar agendamento'}), 500
@app.route('/api/pedido/criar', methods=['POST'])
def api_criar_pedido():
    try:
        payload = request.get_json(force=True) or {}
        pedido = payload.get('pedido') or {}
        itens = payload.get('itens') or []
        conn = get_db(); cur = conn.cursor()
        # Normaliza valores
        subtotal = float(pedido.get('subtotal') or 0)
        frete = float(pedido.get('frete') or 0)
        valor_total = float(pedido.get('valor_total') or (subtotal + frete))
        estado = (pedido.get('estado') or '').upper()[:2]
        # Cria pedido
        cur.execute(
            """
            INSERT INTO tb_pedido
            (id_clientes, data_pedido, nome, cpf, cnpj, cep, logradouro, numero, bairro, complemento, cidade, estado, tel_cel, email, observacao, subtotal, frete, valor_total)
            VALUES (%s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_pedido
            """,
            (
                pedido.get('id_clientes'),
                pedido.get('nome'),
                pedido.get('cpf'),
                pedido.get('cnpj'),
                pedido.get('cep'),
                pedido.get('logradouro'),
                pedido.get('numero'),
                pedido.get('bairro'),
                pedido.get('complemento'),
                pedido.get('cidade'),
                estado,
                pedido.get('tel_cel'),
                pedido.get('email'),
                pedido.get('observacao') or '',
                subtotal,
                frete,
                valor_total,
            )
        )
        id_pedido = cur.fetchone()[0]
        # Itens
        for it in itens:
            cur.execute(
                """
                INSERT INTO tb_itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
                VALUES (%s,%s,%s,%s,%s)
                """,
                (
                    id_pedido,
                    it.get('id_produto'),
                    int(it.get('quantidade') or 0),
                    float(it.get('preco_unitario') or 0),
                    float(it.get('subtotal') or 0),
                )
            )
        conn.commit()
        return jsonify({'ok': True, 'id_pedido': id_pedido})
    except Exception as e:
        print('ERRO PEDIDO:', e)
        print(traceback.format_exc())
        return jsonify({'ok': False, 'error': 'Falha ao criar pedido'}), 500
from werkzeug.security import generate_password_hash, check_password_hash
try:
    import psycopg2
    import psycopg2.extras
except Exception:
    psycopg2 = None

def get_db():
    """Retorna conexão de banco.
    - Se DATABASE_URL estiver definido: usa Postgres (psycopg2) com rows em dict.
    - Caso contrário: SQLite local com row_factory.
    Adapta placeholders '?' -> '%s' e date('now') -> CURRENT_DATE para Postgres.
    """
    db_url = os.environ.get('DATABASE_URL')
    if db_url and psycopg2:
        class _PGConn:
            def __init__(self, url):
                self._conn = psycopg2.connect(url)
                self._conn.autocommit = False
            def _convert_sql(self, sql):
                sql = sql.replace("date('now')", "CURRENT_DATE")
                # Converte placeholders
                out = []
                q_count = 0
                for ch in sql:
                    if ch == '?':
                        out.append('%s')
                        q_count += 1
                    else:
                        out.append(ch)
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
    # Fallback: SQLite
    conn = sqlite3.connect("db_prodcumaru.db")
    conn.row_factory = sqlite3.Row
    return conn

# ==========================================
# 1. ÁREA PÚBLICA (Navegação)
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/api/dashboard/summary')
def api_dashboard_summary():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*), COALESCE(SUM(valor_total),0) FROM tb_pedido")
        pedidos_count, pedidos_total = cur.fetchone()
        cur.execute("""
            SELECT id_pedido, nome, valor_total, data_pedido
            FROM tb_pedido
            ORDER BY id_pedido DESC
            LIMIT 5
        """)
        ultimos_pedidos = [
            {
                'id_pedido': r[0],
                'nome': r[1],
                'valor_total': float(r[2]),
                'data_pedido': r[3].isoformat() if r[3] else None,
            }
            for r in cur.fetchall()
        ]
        cur.execute("SELECT COUNT(*) FROM tb_reg_agendamentos")
        ag_count = cur.fetchone()[0]
        cur.execute("SELECT status, COUNT(*) FROM tb_reg_agendamentos GROUP BY status")
        ag_por_status = {row[0]: row[1] for row in cur.fetchall()}
        cur.execute("""
            SELECT id_reg_agendamentos, nome, servico, data_agend, horario, status
            FROM tb_reg_agendamentos
            ORDER BY data_agend ASC, id_reg_agendamentos DESC
            LIMIT 5
        """)
        proximos_ag = [
            {
                'id': r[0],
                'nome': r[1],
                'servico': r[2],
                'data_agend': r[3].isoformat() if r[3] else None,
                'horario': r[4],
                'status': r[5],
            }
            for r in cur.fetchall()
        ]
        cur.execute("SELECT COUNT(*) FROM tb_clientes_fisico")
        cli_fis = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM tb_clientes_juridicos")
        cli_jur = cur.fetchone()[0]
        cur.execute("""
            SELECT nome, email, data_cad FROM tb_clientes_fisico ORDER BY id_clientes_fisico DESC LIMIT 5
        """)
        ult_cli_fis = [
            {
                'nome': r[0],
                'email': r[1],
                'data_cad': r[2].isoformat() if r[2] else None,
                'tipo': 'fisico'
            } for r in cur.fetchall()
        ]
        cur.execute("""
            SELECT razao_social, email, data_cad FROM tb_clientes_juridicos ORDER BY id_clientes_juridicos DESC LIMIT 5
        """)
        ult_cli_jur = [
            {
                'nome': r[0],
                'email': r[1],
                'data_cad': r[2].isoformat() if r[2] else None,
                'tipo': 'juridico'
            } for r in cur.fetchall()
        ]
        return jsonify({
            'pedidos': {'count': pedidos_count, 'total': float(pedidos_total), 'recentes': ultimos_pedidos},
            'agendamentos': {'count': ag_count, 'por_status': ag_por_status, 'proximos': proximos_ag},
            'clientes': {'fisicos': cli_fis, 'juridicos': cli_jur, 'recentes': ult_cli_fis + ult_cli_jur}
        })
    except Exception as e:
        print('ERRO DASHBOARD:', e)
        return jsonify({'error': 'Falha ao carregar dashboard'}), 500
@app.route("/servicos")
def servicos():
    return render_template("servicos/servicos.html")

@app.route("/galeria")
def galeria():
    return render_template("galeria/galeria.html")

# ==========================================
# 2. ÁREA DO CLIENTE (Login e Portal)
# ==========================================

@app.route("/login-cliente")
def login_cliente():
    # Verifica se usuário já está logado na sessão Flask
    # Se estiver, redireciona direto para o portal
    if 'cliente_id' in session:
        return redirect(url_for('portal'))
    
    # Página de login/cadastro do cliente
    return render_template("login/login-cliente.html")

@app.route("/portal")
def portal():
    # Área logada do cliente (Meus Agendamentos)
    if 'cliente_id' not in session:
        return redirect(url_for('login_cliente'))
    return render_template("portal-cliente/portal-cliente.html")

# API - Login Cliente
@app.route("/api/login-cliente", methods=['POST'])
def api_login_cliente():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    
    conn = get_db()
    
    # Busca em clientes físicos
    cliente = conn.execute(
        "SELECT * FROM tb_clientes_fisico WHERE email = ?",
        (email,)
    ).fetchone()
    
    # Se não encontrar em físico, busca em jurídico
    if not cliente:
        cliente = conn.execute(
            "SELECT * FROM tb_clientes_juridicos WHERE email = ?",
            (email,)
        ).fetchone()
        tipo_cliente = 'juridico' if cliente else None
    else:
        tipo_cliente = 'fisico'
    
    conn.close()
    
    if cliente and cliente['senha'] == senha:  # Comparação direta (trocar por hash em produção)
        # Cria sessão
        if tipo_cliente == 'fisico':
            session['cliente_id'] = cliente['id_clientes_fisico']
            session['cliente_nome'] = cliente['nome']
            session['cliente_email'] = cliente['email']
            session['cliente_tipo'] = 'fisico'
        else:
            session['cliente_id'] = cliente['id_clientes_juridicos']
            session['cliente_nome'] = cliente['razao_social']
            session['cliente_email'] = cliente['email']
            session['cliente_tipo'] = 'juridico'
        
        return jsonify({
            'success': True,
            'user': {
                'id': session['cliente_id'],
                'nome': session['cliente_nome'],
                'email': session['cliente_email']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Email ou senha incorretos'}), 401

# API - Logout Cliente
@app.route("/api/logout-cliente", methods=['POST'])
def api_logout_cliente():
    # Limpa toda a sessão
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

# API - Cadastro Cliente
@app.route("/api/cadastro-cliente", methods=['POST'])
def api_cadastro_cliente():
    data = request.json
    tipo_pessoa = data.get('tipo_pessoa')
    email = data.get('email', '').strip()
    
    conn = get_db()
    
    try:
        # --- VALIDAÇÃO DE DATA DE NASCIMENTO (para PF) ---
        if tipo_pessoa == 'pf':
            data_nasc = data.get('data_nasc', '')
            if data_nasc:
                from datetime import datetime as dt
                try:
                    data_obj = dt.strptime(data_nasc, '%Y-%m-%d')
                    ano = data_obj.year
                    ano_atual = dt.now().year
                    if ano < 1900 or ano > ano_atual - 18:
                        conn.close()
                        return jsonify({'success': False, 'message': f'Data de nascimento inválida! Deve estar entre 1900 e {ano_atual - 18}'}), 400
                except:
                    conn.close()
                    return jsonify({'success': False, 'message': 'Formato de data inválido'}), 400

        # --- VALIDAÇÕES DE DUPLICATA ---
        
        # Verifica email duplicado em ambas as tabelas
        cliente_pf = conn.execute("SELECT id_clientes_fisico FROM tb_clientes_fisico WHERE email = ?", (email,)).fetchone()
        cliente_pj = conn.execute("SELECT id_clientes_juridicos FROM tb_clientes_juridicos WHERE email = ?", (email,)).fetchone()
        
        if cliente_pf or cliente_pj:
            conn.close()
            return jsonify({'success': False, 'message': 'Este email já está cadastrado no sistema'}), 400
        
        if tipo_pessoa == 'pf':
            cpf = data.get('cpf', '').strip()
            
            # Verifica CPF duplicado
            cliente_cpf = conn.execute("SELECT id_clientes_fisico FROM tb_clientes_fisico WHERE cpf = ?", (cpf,)).fetchone()
            if cliente_cpf:
                conn.close()
                return jsonify({'success': False, 'message': 'Este CPF já está cadastrado no sistema'}), 400
            
            # Cliente Físico
            conn.execute('''
                INSERT INTO tb_clientes_fisico 
                (nome, cpf, data_nasc, email, tel_cel, cep, logradouro, numero, bairro, cidade, estado, senha, data_cad)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('nome'),
                cpf,
                data.get('data_nasc'),
                email,
                data.get('telefone'),
                data.get('cep'),
                data.get('logradouro'),
                data.get('numero'),
                data.get('bairro'),
                data.get('cidade'),
                data.get('estado'),
                data.get('senha'),
                datetime.now().strftime('%Y-%m-%d')
            ))
            
            # Cria contrato inicial para o cliente
            conn.execute('''
                INSERT INTO tb_contratos (cliente_ass, titulo_doc, arquivo)
                VALUES (?, ?, ?)
            ''', (
                data.get('nome'),
                'Termo de Adesão - Cadastro Site',
                'contrato_cadastro_' + datetime.now().strftime('%Y%m%d%H%M%S') + '.pdf'
            ))
            
        else:
            cnpj = data.get('cnpj', '').strip()
            
            # Verifica CNPJ duplicado
            cliente_cnpj = conn.execute("SELECT id_clientes_juridicos FROM tb_clientes_juridicos WHERE cnpj = ?", (cnpj,)).fetchone()
            if cliente_cnpj:
                conn.close()
                return jsonify({'success': False, 'message': 'Este CNPJ já está cadastrado no sistema'}), 400
            
            # Cliente Jurídico
            conn.execute('''
                INSERT INTO tb_clientes_juridicos 
                (razao_social, cnpj, email, tel_cel, cep, logradouro, numero, bairro, cidade, estado, senha, data_cad)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('razao_social'),
                cnpj,
                email,
                data.get('telefone'),
                data.get('cep'),
                data.get('logradouro'),
                data.get('numero'),
                data.get('bairro'),
                data.get('cidade'),
                data.get('estado'),
                data.get('senha'),
                datetime.now().strftime('%Y-%m-%d')
            ))
            
            # Cria contrato inicial para o cliente
            conn.execute('''
                INSERT INTO tb_contratos (cliente_ass, titulo_doc, arquivo)
                VALUES (?, ?, ?)
            ''', (
                data.get('razao_social'),
                'Termo de Adesão - Cadastro Site',
                'contrato_cadastro_' + datetime.now().strftime('%Y%m%d%H%M%S') + '.pdf'
            ))
        
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Cadastro realizado com sucesso!'})
    
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# API - Logout
@app.route("/api/logout", methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

# ==========================================
# 3. API DE AGENDAMENTO PÚBLICO (site)
# ==========================================

@app.route("/api/agendamento-publico", methods=['POST'])
def api_agendamento_publico():
    """API para salvar agendamento feito no site"""
    data = request.json
    
    conn = get_db()
    try:
        # Converte data do formato brasileiro para ISO (YYYY-MM-DD)
        data_agend_str = data.get('data', '')
        if ' às ' in data_agend_str:
            # Formato: "25/12/2025 às 15:00" -> "2025-12-25"
            data_parte = data_agend_str.split(' às ')[0]
            dia, mes, ano = data_parte.split('/')
            data_agend_iso = f"{ano}-{mes}-{dia}"
        else:
            # Fallback
            data_agend_iso = data_agend_str
        # Busca se já existe cliente com este email
        cliente_id = None
        tipo_cliente = 'PF'
        
        # Tenta encontrar em PF
        pf = conn.execute(
            "SELECT id_clientes_fisico, nome FROM tb_clientes_fisico WHERE email = ?",
            (data.get('email'),)
        ).fetchone()
        
        if pf:
            cliente_id = pf['id_clientes_fisico']
            nome = pf['nome']
        else:
            # Tenta encontrar em PJ
            pj = conn.execute(
                "SELECT id_clientes_juridicos, razao_social FROM tb_clientes_juridicos WHERE email = ?",
                (data.get('email'),)
            ).fetchone()
            
            if pj:
                cliente_id = pj['id_clientes_juridicos']
                nome = pj['razao_social']
                tipo_cliente = 'PJ'
            else:
                # Cliente novo - não cadastrado ainda
                cliente_id = 0
                nome = data.get('nome')
        
        # Insere o agendamento
        conn.execute('''
            INSERT INTO tb_reg_agendamentos 
            (id_cliente, nome, email, tel_cel, horario, data_agend, tipo_cliente, servico, status, obs, valor_total, forma_pagamento, status_pagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Agendado', ?, ?, ?, 'Pendente')
        ''', (
            cliente_id,
            nome,
            data.get('email'),
            data.get('telefone', ''),
            data.get('horario', '00:00'),
            data_agend_iso,
            tipo_cliente,
            data.get('servico'),
            data.get('observacao', ''),
            data.get('valor', 0.0),
            data.get('forma_pagamento', 'Não informado')
        ))
        
        conn.commit()
        agendamento_id = conn.execute("SELECT lastval()").fetchone()[0]
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Agendamento realizado com sucesso!',
            'id': agendamento_id
        })
        
    except Exception as e:
        conn.close()
        error_msg = str(e) if str(e) else 'Erro desconhecido'
        tb_str = traceback.format_exc()
        print(f"ERRO AGENDAMENTO PÚBLICO: {error_msg}", file=sys.stderr)
        print(tb_str, file=sys.stderr)
        return jsonify({
            'success': False,
            'message': f'Erro ao criar agendamento: {error_msg}'
        }), 500

# ==========================================
# 4. API DE PEDIDOS (loja)
# ==========================================

@app.route("/api/pedido", methods=['POST'])
def api_pedido():
    """API para salvar pedido da loja"""
    data = request.json
    
    conn = get_db()
    try:
        # Busca se já existe cliente com este email
        cliente_id = None
        
        pf = conn.execute(
            "SELECT id_clientes_fisico FROM tb_clientes_fisico WHERE email = ?",
            (data.get('email'),)
        ).fetchone()
        
        if pf:
            cliente_id = pf['id_clientes_fisico']
        else:
            pj = conn.execute(
                "SELECT id_clientes_juridicos FROM tb_clientes_juridicos WHERE email = ?",
                (data.get('email'),)
            ).fetchone()
            if pj:
                cliente_id = pj['id_clientes_juridicos']
        
        # Insere o pedido
        conn.execute('''
            INSERT INTO tb_pedido 
            (id_clientes, data_pedido, nome, cpf, cnpj, cep, logradouro, numero, bairro, complemento, cidade, estado, tel_cel, email, observacao, subtotal, frete, valor_total)
            VALUES (?, CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            cliente_id,
            data.get('nome'),
            data.get('cpf', ''),
            data.get('cnpj', ''),
            data.get('cep'),
            data.get('logradouro'),
            data.get('numero'),
            data.get('bairro'),
            data.get('complemento', ''),
            data.get('cidade'),
            data.get('estado'),
            data.get('telefone'),
            data.get('email'),
            data.get('observacao', ''),
            data.get('subtotal', 0.0),
            data.get('frete', 0.0),
            data.get('total', 0.0)
        ))
        
        pedido_id = conn.execute("SELECT lastval()").fetchone()[0]
        
        # Insere os itens do pedido
        produtos = data.get('produtos', [])
        for produto in produtos:
            conn.execute('''
                INSERT INTO tb_itens_pedido 
                (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                pedido_id,
                produto.get('id'),
                produto.get('quantidade'),
                produto.get('preco'),
                produto.get('preco') * produto.get('quantidade')
            ))
            
            # Atualiza estoque
            conn.execute('''
                UPDATE tb_produto 
                SET estoque = estoque - ?
                WHERE id_produto = ?
            ''', (produto.get('quantidade'), produto.get('id')))
        
        # Registra na tabela financeira
        conn.execute('''
            INSERT INTO tb_financas 
            (tipo, nome, cliente_ass, valor_total, data_emissao, data_vencimento, status, obs)
            VALUES (?, ? || ?, ?, CURRENT_DATE, CURRENT_DATE, 'Pendente', ?)
        ''', (
            'Receita',
            'Pedido Loja #',
            pedido_id,
            data.get('nome'),
            data.get('total', 0.0),
            data.get('forma_pagamento', 'Não informado')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Pedido realizado com sucesso!',
            'numero_pedido': pedido_id
        })
        
    except Exception as e:
        conn.close()
        error_msg = str(e) if str(e) else 'Erro desconhecido'
        tb_str = traceback.format_exc()
        print(f"ERRO PEDIDO: {error_msg}", file=sys.stderr)
        print(tb_str, file=sys.stderr)
        return jsonify({
            'success': False,
            'message': f'Erro ao criar pedido: {error_msg}'
        }), 500

@app.route("/agendar_publico", methods=['POST'])
def agendar_publico():
    # Esta rota recebe o formulário da página de Serviços (servicos.html)
    if request.method == 'POST':
        # Aqui você pode capturar os dados e salvar na tabela de pré-agendamento ou clientes
        # Por enquanto, apenas redireciona para simular o fluxo
        return redirect(url_for('portal'))

# ==========================================
# 4. ÁREA DA LOJA
# ==========================================

@app.route("/loja")
def loja():
    """Página principal da loja com lista de produtos"""
    return render_template("loja/loja.html")

@app.route("/produto/<int:id>")
def pagina_produto(id):
    conn = get_db()
    produto = conn.execute(
        "SELECT * FROM tb_produto WHERE id_produto = ?",
        (id,)
    ).fetchone()
    conn.close()

    # Renderiza sempre; se 'produto' vier None, o JS usa o fallback 'productsDB'
    return render_template("loja/pagina-produto.html", produto=produto, produto_id=id)

@app.route("/carrinho")
def carrinho():
    """Página do carrinho de compras"""
    return render_template("loja/carrinho.html")

@app.route("/checkout")
def checkout():
    """Página de finalização de compra"""
    return render_template("loja/checkout.html")

# ==========================================
# 5. API para produtos (JSON)
# ==========================================

@app.route("/api/produtos")
def api_produtos():
    """Retorna todos os produtos em formato JSON"""
    conn = get_db()
    produtos = conn.execute(
        "SELECT * FROM tb_produto WHERE status = 'Ativo' ORDER BY data_cad DESC"
    ).fetchall()
    conn.close()
    
    # Converte Row objects para dicionários
    produtos_list = []
    for produto in produtos:
        produtos_list.append({
            'id_produto': produto['id_produto'],
            'nome_produto': produto['nome_produto'],
            'codigo': produto['codigo'],
            'descricao': produto['descricao'],
            'tamanho': produto['tamanho'],
            'estoque': produto['estoque'],
            'preco': produto['preco'],
            'foto_prod': produto['foto_prod'],
            'status': produto['status'],
            'data_cad': produto['data_cad']
        })
    
    return jsonify(produtos_list)

@app.route("/api/produto/<int:id>")
def api_produto(id):
    """Retorna um produto específico em formato JSON"""
    conn = get_db()
    produto = conn.execute(
        "SELECT * FROM tb_produto WHERE id_produto = ?", 
        (id,)
    ).fetchone()
    conn.close()
    
    if produto:
        produto_dict = {
            'id_produto': produto['id_produto'],
            'nome_produto': produto['nome_produto'],
            'codigo': produto['codigo'],
            'descricao': produto['descricao'],
            'tamanho': produto['tamanho'],
            'estoque': produto['estoque'],
            'preco': produto['preco'],
            'foto_prod': produto['foto_prod'],
            'status': produto['status'],
            'data_cad': produto['data_cad']
        }
        return jsonify(produto_dict)
    else:
        return jsonify({'error': 'Produto não encontrado'}), 404

# ==========================================
# INICIALIZAÇÃO
# ==========================================

if __name__ == "__main__":
    # Roda na porta padrão 5000
    app.run(debug=True, port=5000)

# ==========================================
# 6. SEED - Inserir produtos iniciais (apenas uma vez)
# ==========================================

# ATENÇÃO: Descomente e rode uma vez para inserir os produtos iniciais. Depois comente novamente.

# runner rápido: execute no REPL do Python com o venv ativo, dentro do projeto
import sqlite3
con = sqlite3.connect('db_prodcumaru.db')
cur = con.cursor()
# cole os INSERTS (um por vez ou todos)
con.commit()
con.close()

# conn = get_db()
# conn.execute("PRAGMA foreign_keys=OFF;") # Desabilita temporariamente as FK
# conn.execute("DELETE FROM tb_produto;") # Limpa a tabela (cuidado!)
# conn.execute("PRAGMA foreign_keys=ON;") # Reabilita as FK

# # Insere os produtos
# conn.executescript("""
# INSERT INTO tb_produto (nome_produto, codigo, descricao, tamanho, estoque, preco, foto_prod, status, data_cad)
# VALUES
# ('Camiseta Cumaru', 'CAM-001', 'Modelagem oversized exclusiva.', 'P,M,G,GG', '100', 89.90, '/static/img/produtos-loja/camiseta1.1.png', 'Ativo', date('now')),

# ('Moletom Cumaru', 'MOL-001', 'Moletom canguru com capuz.', 'P,M,G,GG', '50', 119.90, '/static/img/produtos-loja/moletom1.png', 'Ativo', date('now')),

# ('Boné Dad Hat', 'BON-001', 'Boné estilo Dad Hat com bordado.', '', '80', 55.00, '/static/img/produtos-loja/bone.frontal.png', 'Ativo', date('now')),

# ('Copo Cumaru', 'COP-001', 'Copo térmico de fibra de bambu.', '', '120', 45.00, '/static/img/produtos-loja/copo.cumaru.png', 'Ativo', date('now')),

# ('Chaveiro Metal', 'CHA-001', 'Chaveiro de metal com logo.', '', '200', 25.00, '/static/img/produtos-loja/chaveiro.cumaru.png', 'Ativo', date('now')),

# ('Álbum', 'ALB-001', 'Álbum físico oficial.', '', '300', 15.00, '/static/img/produtos-loja/album.png', 'Ativo', date('now'));
# """)
# conn.commit()
# conn.close()

# ==========================================
# APIS PARA INTEGRAÇÃO COM BANCO DE DADOS
# ==========================================

# API - Buscar agendamentos do cliente logado
@app.route("/api/meus-agendamentos", methods=['GET'])
def api_meus_agendamentos():
    if 'cliente_id' not in session:
        return jsonify({'success': False, 'message': 'Não autorizado'}), 401
    
    conn = get_db()
    agendamentos = conn.execute(
        """SELECT * FROM tb_reg_agendamentos 
           WHERE id_cliente = ? 
           ORDER BY data_agend DESC""",
        (session['cliente_id'],)
    ).fetchall()
    conn.close()
    
    lista = []
    for ag in agendamentos:
        lista.append({
            'id': ag['id_reg_agendamentos'],
            'servico': ag['servico'],
            'data': ag['data_agend'] + ' às ' + ag['horario'],
            'status': ag['status'],
            'valor': ag['valor_total'],
            'pagamento': ag['forma_pagamento'],
            'observacoes': ag['obs']
        })
    
    return jsonify({'success': True, 'agendamentos': lista})

# API - Criar agendamento (cliente logado)
@app.route("/api/agendamentos", methods=['POST'])
def api_criar_agendamento_cliente():
    if 'cliente_id' not in session:
        return jsonify({'success': False, 'message': 'Não autorizado'}), 401
    data = request.json or {}
    # Validações de data/horário
    data_agend_raw = data.get('data')
    horario = data.get('horario', '00:00')
    servico = data.get('servico')
    if not data_agend_raw or not servico:
        return jsonify({'success': False, 'message': 'Data e serviço são obrigatórios'}), 400
    
    # Converte data do formato brasileiro para ISO (YYYY-MM-DD)
    data_agend = None
    if data_agend_raw:
        if ' às ' in str(data_agend_raw):
            # Formato: "25/12/2025 às 15:00" -> "2025-12-25"
            data_parte = str(data_agend_raw).split(' às ')[0]
            try:
                dia, mes, ano = data_parte.split('/')
                data_agend = f"{ano}-{mes}-{dia}"
            except:
                data_agend = str(data_agend_raw)
        else:
            data_agend = str(data_agend_raw)
    
    if not data_agend:
        return jsonify({'success': False, 'message': 'Data inválida'}), 400
    
    try:
        # Data futura e formato válido
        dt_data = datetime.strptime(data_agend, '%Y-%m-%d')
        if dt_data.date() < datetime.now().date():
            return jsonify({'success': False, 'message': 'Data não pode ser no passado'}), 400
    except Exception:
        return jsonify({'success': False, 'message': 'Formato de data inválido (YYYY-MM-DD)'}), 400

    conn = get_db()
    try:
        # Verifica conflito básico (mesmo cliente, mesma data/horário)
        conflito = conn.execute(
            """
            SELECT 1 FROM tb_reg_agendamentos 
            WHERE id_cliente = ? AND data_agend = ? AND horario = ?
            """,
            (session['cliente_id'], data_agend, horario)
        ).fetchone()
        if conflito:
            conn.close()
            return jsonify({'success': False, 'message': 'Já existe um agendamento nesse horário'}), 409

        # Dados do cliente
        if session.get('cliente_tipo') == 'fisico':
            cli = conn.execute("SELECT nome, email, tel_cel FROM tb_clientes_fisico WHERE id_clientes_fisico = ?", (session['cliente_id'],)).fetchone()
            tipo_cli = 'PF'
        else:
            cli = conn.execute("SELECT razao_social as nome, email, tel_cel FROM tb_clientes_juridicos WHERE id_clientes_juridicos = ?", (session['cliente_id'],)).fetchone()
            tipo_cli = 'PJ'

        conn.execute(
            """
            INSERT INTO tb_reg_agendamentos 
            (id_cliente, nome, email, tel_cel, horario, data_agend, tipo_cliente, servico, status, obs, valor_total, forma_pagamento, status_pagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Agendado', ?, ?, ?, 'Pendente')
            """,
            (
                session['cliente_id'],
                cli['nome'],
                cli['email'],
                cli['tel_cel'],
                horario,
                data_agend,
                tipo_cli,
                servico,
                data.get('observacao', ''),
                float(data.get('valor', 0.0)),
                data.get('forma_pagamento', 'Não informado')
            )
        )
        conn.commit()
        ag_id = conn.execute("SELECT lastval()").fetchone()[0]
        conn.close()
        return jsonify({'success': True, 'id': ag_id})
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# API - Buscar pedidos do cliente logado
@app.route("/api/meus-pedidos", methods=['GET'])
def api_meus_pedidos():
    if 'cliente_id' not in session:
        return jsonify({'success': False, 'message': 'Não autorizado'}), 401
    
    conn = get_db()
    pedidos = conn.execute(
        """SELECT * FROM tb_pedido 
           WHERE id_clientes = ? 
           ORDER BY data_pedido DESC""",
        (session['cliente_id'],)
    ).fetchall()
    conn.close()
    
    lista = []
    for p in pedidos:
        lista.append({
            'id': p['id_pedido'],
            'data': p['data_pedido'],
            'valor': p['valor_total'],
            'status': 'Pago',  # Pode adicionar coluna status na tabela depois
            'nome': p['nome'],
            'endereco': f"{p['logradouro']}, {p['numero']} - {p['bairro']}, {p['cidade']}/{p['estado']}"
        })
    
    return jsonify({'success': True, 'pedidos': lista})

# ==========================================
# 7. API - Meus Contratos (portal)
# ==========================================

@app.route("/api/meus-contratos", methods=['GET'])
def api_meus_contratos():
    if 'cliente_id' not in session:
        return jsonify({'success': False, 'message': 'Não autorizado'}), 401

    conn = get_db()
    try:
        # Determina nome do cliente conforme tipo (PF/PJ)
        if session.get('cliente_tipo') == 'fisico':
            cli = conn.execute(
                "SELECT nome as nome FROM tb_clientes_fisico WHERE id_clientes_fisico = ?",
                (session['cliente_id'],)
            ).fetchone()
        else:
            cli = conn.execute(
                "SELECT razao_social as nome FROM tb_clientes_juridicos WHERE id_clientes_juridicos = ?",
                (session['cliente_id'],)
            ).fetchone()

        nome_cliente = cli['nome'] if cli else None
        if not nome_cliente:
            conn.close()
            return jsonify({'success': False, 'message': 'Cliente não encontrado'}), 404

        contratos = conn.execute(
            "SELECT id_contratos, cliente_ass, titulo_doc, arquivo FROM tb_contratos WHERE cliente_ass = ? ORDER BY id_contratos DESC",
            (nome_cliente,)
        ).fetchall()
        conn.close()

        return jsonify({
            'success': True,
            'contratos': [
                {
                    'id': c['id_contratos'],
                    'cliente': c['cliente_ass'],
                    'titulo': c['titulo_doc'],
                    'arquivo': c['arquivo']
                } for c in contratos
            ]
        })
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': str(e)}), 500

# ==========================================
# 8. API - Verificar se pode avaliar (deve ter comprado)
# ==========================================

@app.route("/api/pode-avaliar", methods=['GET'])
def api_pode_avaliar():
    """Verifica se o cliente logado tem pelo menos um pedido."""
    if 'cliente_id' not in session:
        return jsonify({'success': False, 'pode_avaliar': False, 'message': 'Faça login para avaliar'}), 401
    
    conn = get_db()
    pedido = conn.execute(
        """SELECT id_pedido FROM tb_pedido 
           WHERE id_clientes = ? 
           LIMIT 1""",
        (session['cliente_id'],)
    ).fetchone()
    conn.close()
    
    pode_avaliar = pedido is not None
    
    if pode_avaliar:
        return jsonify({'success': True, 'pode_avaliar': True, 'message': 'Você pode avaliar este produto'})
    else:
        return jsonify({'success': False, 'pode_avaliar': False, 'message': 'Apenas clientes que realizaram compras podem avaliar'}), 403

if __name__ == "__main__":
    app.run(debug=False, port=5000)
