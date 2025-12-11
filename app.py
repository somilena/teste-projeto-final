from flask import Flask, render_template, request, redirect, url_for, jsonify
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
