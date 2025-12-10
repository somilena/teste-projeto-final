from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
import os
from datetime import datetime

# Configurações do App
app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'segredo_sga_cumaru' # Necessário para segurança de sessão

# Configuração de Upload de Arquivos
UPLOAD_FOLDER = 'static/uploads/contratos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Função para conectar ao banco
def get_db():
    conn = sqlite3.connect("db_prodcumaru.db")
    conn.row_factory = sqlite3.Row # Permite acessar colunas pelo nome (ex: row['nome'])
    return conn

# ==========================================
# 1. ROTA PRINCIPAL (DASHBOARD)
# ==========================================
@app.route("/gestao")
def dashboard():
    conn = get_db()
    cur = conn.cursor()

    # --- ESTATÍSTICAS (CARDS) ---
    try:
        # Total de Agendamentos
        total_agendamentos = cur.execute("SELECT COUNT(*) FROM tb_reg_agendamentos").fetchone()[0]
        
        # Total de Clientes (Soma PF + PJ)
        total_pf = cur.execute("SELECT COUNT(*) FROM tb_clientes_fisico").fetchone()[0]
        total_pj = cur.execute("SELECT COUNT(*) FROM tb_clientes_juridicos").fetchone()[0]
        total_clientes = total_pf + total_pj
        
        # Faturamento (Soma de Receitas)
        faturamento = cur.execute("SELECT SUM(valor_total) FROM tb_financas WHERE tipo='Receita'").fetchone()[0] or 0.0
    except:
        # Caso o banco esteja vazio ou com erro
        total_agendamentos = 0
        total_clientes = 0
        faturamento = 0.0

    # --- LISTAS DE DADOS (PARA AS TABELAS) ---
    receitas = cur.execute("SELECT * FROM tb_financas WHERE tipo='Receita' ORDER BY data_emissao DESC").fetchall()
    despesas = cur.execute("SELECT * FROM tb_financas WHERE tipo='Despesa' ORDER BY data_emissao DESC").fetchall()
    funcionarios = cur.execute("SELECT * FROM tb_funcionarios").fetchall()
    contratos = cur.execute("SELECT * FROM tb_contratos").fetchall()
    agendamentos = cur.execute("SELECT * FROM tb_reg_agendamentos ORDER BY data_agend DESC").fetchall()

    # Lista Unificada de Clientes (PF e PJ juntos)
    lista_clientes = []
    pfs = cur.execute("SELECT id_clientes_fisico as id, nome, email, tel_cel, 'PF' as tipo, cpf as doc FROM tb_clientes_fisico").fetchall()
    pjs = cur.execute("SELECT id_clientes_juridicos as id, razao_social as nome, email, tel_cel, 'PJ' as tipo, cnpj as doc FROM tb_clientes_juridicos").fetchall()
    lista_clientes.extend(pfs)
    lista_clientes.extend(pjs)

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
                           clientes=lista_clientes)

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

# --- SALVAR NOVO FUNCIONÁRIO ---
@app.route("/gestao/funcionario/novo", methods=['POST'])
def novo_funcionario():
    conn = get_db()
    conn.execute("""
        INSERT INTO tb_funcionarios (nome, cpf, email, tel_cel, cargo, senha_aces, data_admis, log_aces, nivel_aces, status)
        VALUES (?, ?, ?, ?, ?, ?, date('now'), ?, '1', 'Ativo')
    """, (
        request.form['nome'],     # name="nome"
        request.form['cpf'],      # name="cpf"
        request.form['email'],    # name="email"
        request.form.get('tel_cel', request.form.get('telefone')), # name="tel_cel" or fallback to telefone
        request.form['cargo'],    # name="cargo"
        request.form['senha'],    # name="senha"
        request.form['email']     # Usa o email como login
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
    return [dict(func) for func in funcionarios]


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
    return jsonify([dict(ag) for ag in agendamentos])

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

# Inicialização
if __name__ == "__main__":
    # Roda na porta 5001 para não conflitar com o site principal (5000)
    app.run(debug=True, port=5001)