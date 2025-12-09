from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
import os
from datetime import datetime

# Configuração
app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'super_secret_key_sga'
UPLOAD_FOLDER = 'static/uploads/contratos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db():
    conn = sqlite3.connect("db_prodcumaru.db")
    conn.row_factory = sqlite3.Row
    return conn

# ==============================================================================
# 1. ROTAS DE VISUALIZAÇÃO (GET)
# ==============================================================================

@app.route("/")
def index():
    return redirect(url_for('login_staff'))

@app.route("/login-staff", methods=['GET', 'POST'])
def login_staff():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        # Login Simulado (Admin Master)
        if email == "admin@prodcumaru.com" and senha == "admin123":
            return redirect(url_for('dashboard'))
        else:
            flash('Acesso negado!', 'error')
    return render_template("login/login-staff.html")

@app.route("/gestao")
def dashboard():
    conn = get_db()
    cursor = conn.cursor()

    # --- DADOS PARA O DASHBOARD (Visão Geral) ---
    total_agendamentos = cursor.execute("SELECT COUNT(*) FROM tb_reg_agendamentos").fetchone()[0]
    total_clientes = cursor.execute("SELECT COUNT(*) FROM tb_clientes_fisico").fetchone()[0] + \
                     cursor.execute("SELECT COUNT(*) FROM tb_clientes_juridicos").fetchone()[0]
    
    receita_total = cursor.execute("SELECT SUM(valor_total) FROM tb_financas WHERE tipo='Receita'").fetchone()[0] or 0.0
    
    # --- LISTAS COMPLETAS PARA AS SEÇÕES ---
    receitas = cursor.execute("SELECT * FROM tb_financas WHERE tipo='Receita' ORDER BY data_emissao DESC").fetchall()
    despesas = cursor.execute("SELECT * FROM tb_financas WHERE tipo='Despesa' ORDER BY data_emissao DESC").fetchall()
    agendamentos = cursor.execute("SELECT * FROM tb_reg_agendamentos ORDER BY data_agend DESC").fetchall()
    funcionarios = cursor.execute("SELECT * FROM tb_funcionarios").fetchall()
    contratos = cursor.execute("SELECT * FROM tb_contratos").fetchall()
    
    # Clientes (Unindo Físico e Jurídico para a tabela)
    clientes_pf = cursor.execute("SELECT id_clientes_fisico as id, nome, email, tel_cel, 'PF' as tipo FROM tb_clientes_fisico").fetchall()
    clientes_pj = cursor.execute("SELECT id_clientes_juridicos as id, razao_social as nome, email, tel_cel, 'PJ' as tipo FROM tb_clientes_juridicos").fetchall()
    todos_clientes = clientes_pf + clientes_pj

    conn.close()

    return render_template("gestao/gestao.html",
                           total_agendamentos=total_agendamentos,
                           total_clientes=total_clientes,
                           faturamento=receita_total,
                           agendamentos_lista=agendamentos, # Usar no loop da tabela agendamentos
                           receitas_lista=receitas,         # Usar no loop da tabela receitas
                           despesas_lista=despesas,         # Usar no loop da tabela despesas
                           clientes_lista=todos_clientes,   # Usar no loop da tabela clientes
                           funcionarios_lista=funcionarios, # Usar no loop da tabela funcionarios
                           contratos_lista=contratos        # Usar no loop da tabela contratos
                           )

# ==============================================================================
# 2. ROTAS DE AÇÃO (POST - SALVAR DADOS)
# ==============================================================================

# --- A. FINANCEIRO (Receitas e Despesas) ---
@app.route("/gestao/salvar_receita", methods=['POST'])
def salvar_receita():
    origem = request.form.get('origem')   # name="origem" no HTML
    cliente = request.form.get('cliente') # name="cliente"
    data = request.form.get('data')       # name="data"
    valor = request.form.get('valor')     # name="valor"
    obs = request.form.get('obs')         # name="obs"
    
    conn = get_db()
    conn.execute("""
        INSERT INTO tb_financas (tipo, nome, cliente_ass, valor_total, data_emissao, data_vencimento, obs, status)
        VALUES ('Receita', ?, ?, ?, ?, ?, ?, 'Pago')
    """, (origem, cliente, valor, data, data, obs)) # Data vencimento = emissão para receitas à vista
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

@app.route("/gestao/salvar_despesa", methods=['POST'])
def salvar_despesa():
    nome = request.form.get('nome')       # name="nome"
    data_emissao = request.form.get('data_emissao')
    data_venc = request.form.get('data_vencimento')
    valor = request.form.get('valor')
    status = request.form.get('status')
    obs = request.form.get('obs')

    conn = get_db()
    conn.execute("""
        INSERT INTO tb_financas (tipo, nome, valor_total, data_emissao, data_vencimento, status, obs)
        VALUES ('Despesa', ?, ?, ?, ?, ?, ?)
    """, (nome, valor, data_emissao, data_venc, status, obs))
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# --- B. AGENDAMENTOS ---
@app.route("/gestao/salvar_agendamento", methods=['POST'])
def salvar_agendamento():
    titulo = request.form.get('titulo')
    data = request.form.get('data')
    obs = request.form.get('obs')
    tipo = request.form.get('tipo')
    
    # Campos obrigatórios fictícios para completar a tabela (pode ajustar depois)
    id_cliente_padrao = 1 
    
    conn = get_db()
    conn.execute("""
        INSERT INTO tb_reg_agendamentos (id_cliente, nome, email, tel_cel, horario, data_agend, servico, status, obs, valor_total, forma_pagamento, status_pagamento, tipo_cliente)
        VALUES (?, 'Cliente Balcão', 'N/A', 'N/A', '00:00', ?, ?, 'Agendado', ?, '0.00', 'N/A', 'Pendente', 'Fisica')
    """, (id_cliente_padrao, data, f"{titulo} ({tipo})", obs))
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# --- C. FUNCIONÁRIOS ---
@app.route("/gestao/salvar_funcionario", methods=['POST'])
def salvar_funcionario():
    nome = request.form.get('nome')
    cpf = request.form.get('cpf')
    email = request.form.get('email')
    telefone = request.form.get('telefone')
    cargo = request.form.get('cargo')
    senha = request.form.get('senha')
    
    conn = get_db()
    conn.execute("""
        INSERT INTO tb_funcionarios (nome, cpf, email, tel_cel, cargo, senha_aces, data_admis, log_aces, nivel_aces, status)
        VALUES (?, ?, ?, ?, ?, ?, date('now'), ?, '1', 'Ativo')
    """, (nome, cpf, email, telefone, cargo, senha, email))
    conn.commit()
    conn.close()
    return redirect(url_for('dashboard'))

# --- D. CONTRATOS ---
@app.route("/gestao/salvar_contrato", methods=['POST'])
def salvar_contrato():
    cliente = request.form.get('cliente')
    titulo = request.form.get('titulo')
    arquivo = request.files['arquivo']
    
    if arquivo:
        filename = f"{datetime.now().timestamp()}_{arquivo.filename}"
        arquivo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        conn = get_db()
        conn.execute("INSERT INTO tb_contratos (cliente_ass, titulo_doc, arquivo) VALUES (?, ?, ?)", 
                     (cliente, titulo, filename))
        conn.commit()
        conn.close()
        
    return redirect(url_for('dashboard'))

# --- E. ATUALIZAR CLIENTE (PF/PJ) ---
@app.route("/gestao/update_cliente", methods=['POST'])
def update_cliente():
    tipo = request.form.get('tipo_atual') # 'PF' ou 'PJ' - Precisa vir do hidden input
    id_cliente = request.form.get('id')   # Precisa vir do hidden input

    conn = get_db()
    
    if tipo == 'PF':
        conn.execute("""
            UPDATE tb_clientes_fisico 
            SET nome=?, cpf=?, email=?, tel_cel=?, cep=?, logradouro=?, numero=?, bairro=?, cidade=?, estado=?
            WHERE id_clientes_fisico=?
        """, (
            request.form.get('nome'), request.form.get('cpf'), request.form.get('email'),
            request.form.get('telefone'), request.form.get('cep'), request.form.get('logradouro'),
            request.form.get('numero'), request.form.get('bairro'), request.form.get('cidade'),
            request.form.get('uf'), id_cliente
        ))
    else:
        conn.execute("""
            UPDATE tb_clientes_juridicos
            SET razao_social=?, cnpj=?, email=?, tel_cel=?, cep=?, logradouro=?, numero=?, bairro=?, cidade=?, estado=?
            WHERE id_clientes_juridicos=?
        """, (
            request.form.get('razao'), request.form.get('cnpj'), request.form.get('email'),
            request.form.get('telefone'), request.form.get('cep'), request.form.get('logradouro'),
            request.form.get('numero'), request.form.get('bairro'), request.form.get('cidade'),
            request.form.get('uf'), id_cliente
        ))

    conn.commit()
    conn.close()
    return jsonify({'success': True}) # Retorna JSON pois será chamado via AJAX/Fetch

if __name__ == "__main__":
    app.run(debug=True, port=5001)