from flask import Flask, render_template, request, redirect, url_for
import sqlite3

# Configura o Flask para usar as pastas certas
app = Flask(__name__, template_folder='templates', static_folder='static')

# Função auxiliar para conectar ao banco
def get_db():
    # Certifique-se de que o arquivo 'db_prodcumaru.db' existe na raiz
    return sqlite3.connect("db_prodcumaru.db")

# =======================================================
# ROTAS DE NAVEGAÇÃO (Páginas do Site)
# =======================================================

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
    # Futuramente, aqui você vai buscar dados do banco para o Dashboard
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

# =======================================================
# ROTAS DE BANCO DE DADOS (CRUD Clientes - Seu código)
# =======================================================

@app.route("/cliente")
def cliente():
    con = get_db()
    cur = con.cursor()
    # ATENÇÃO: Verifique se sua tabela no banco chama 'tb_clientes' ou 'tb_clientes_fisico'
    try:
        cur.execute("SELECT * FROM tb_clientes") 
        dados = cur.fetchall()
    except sqlite3.OperationalError:
        dados = [] # Evita erro se a tabela não existir ainda
        print("Erro: Tabela tb_clientes não encontrada.")
    con.close()
    
    # Se você ainda não tem um 'cliente.html' específico, pode usar o gestão para testar
    # ou criar um arquivo temporário em templates/gestao/clientes_lista.html
    return render_template("gestao/cadastro-cliente.html", clientes=dados) 

@app.route("/cliente/novo", methods=["POST"])
def cliente_novo():
    if request.method == "POST":
        nome = request.form["nome"]
        # Adapte os campos conforme o seu formulário HTML real
        # data_nasc = request.form["data_nasc"] 
        email = request.form["email"]
        tel = request.form.get("telefone", "") # .get evita erro se não vier

        con = get_db()
        cur = con.cursor()
        # Ajuste a query conforme a tabela real do seu banco SQLite
        cur.execute("""
            INSERT INTO tb_clientes (nome, email, telefone)
            VALUES (?, ?, ?)
        """, (nome, email, tel))
        con.commit()
        con.close()
        return redirect(url_for('gestao')) # Redireciona para o painel

# =======================================================
# INICIALIZAÇÃO
# =======================================================

if __name__ == "__main__":
    app.run(debug=True)