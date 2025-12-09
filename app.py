from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__, template_folder='templates', static_folder='static')

def get_db():
    conn = sqlite3.connect("db_prodcumaru.db")
    conn.row_factory = sqlite3.Row
    return conn

# ==========================================
# 1. ÁREA PÚBLICA (Navegação)
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")

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
    # Página de login/cadastro do cliente
    return render_template("login/login-cliente.html")

@app.route("/portal")
def portal():
    # Área logada do cliente (Meus Agendamentos)
    # Futuramente aqui você buscará os dados do cliente no banco
    return render_template("portal-cliente/portal-cliente.html")

# ==========================================
# 3. ROTA DE AGENDAMENTO (Pública)
# ==========================================

@app.route("/agendar_publico", methods=['POST'])
def agendar_publico():
    # Esta rota recebe o formulário da página de Serviços (servicos.html)
    if request.method == 'POST':
        # Aqui você pode capturar os dados e salvar na tabela de pré-agendamento ou clientes
        # Por enquanto, apenas redireciona para simular o fluxo
        return redirect(url_for('portal'))

# ==========================================
# INICIALIZAÇÃO
# ==========================================

if __name__ == "__main__":
    # Roda na porta padrão 5000
    app.run(debug=True, port=5000)