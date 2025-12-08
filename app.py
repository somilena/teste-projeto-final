from flask import Flask, render_template, request, redirect, url_for
import sqlite3

# Configura pastas
app = Flask(__name__, template_folder='templates', static_folder='static')

def get_db():
    return sqlite3.connect("db_prodcumaru.db")

# ==========================================
# ROTAS DE NAVEGAÇÃO (O Site)
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/loja")
def loja():
    return render_template("loja/loja.html")

@app.route("/servicos")
def servicos():
    return render_template("servicos/servicos.html")

@app.route("/galeria")
def galeria():
    return render_template("galeria/galeria.html")

@app.route("/gestao")
def gestao():
    return render_template("gestao/gestao.html")

@app.route("/portal")
def portal():
    return render_template("portal-cliente/portal-cliente.html")

@app.route("/login-cliente")
def login_cliente():
    return render_template("login/login-cliente.html")

@app.route("/login-staff")
def login_staff():
    return render_template("login/login-staff.html")

# ==========================================
# ROTAS DE BANCO DE DADOS (Seu CRUD)
# ==========================================

@app.route("/cliente")
def cliente():
    # Aqui você pode redirecionar para a gestão ou renderizar uma lista
    con = get_db()
    cur = con.cursor()
    try:
        cur.execute("SELECT * FROM tb_clientes")
        dados = cur.fetchall()
    except:
        dados = []
    con.close()
    return render_template("gestao/cadastro-cliente.html", clientes=dados)

@app.route("/cliente/novo", methods=["POST"])
def cliente_novo():
    if request.method == "POST":
        nome = request.form["nome"]
        email = request.form["email"]
        tel = request.form.get("telefone", "")
        
        con = get_db()
        cur = con.cursor()
        cur.execute("INSERT INTO tb_clientes (nome, email, telefone) VALUES (?, ?, ?)", (nome, email, tel))
        con.commit()
        con.close()
        return redirect(url_for('gestao')) # Volta para gestão após salvar

# ... (Mantenha suas rotas de Fornecedor aqui se precisar) ...

if __name__ == "__main__":
    app.run(debug=True)