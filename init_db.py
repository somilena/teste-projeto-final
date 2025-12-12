import sqlite3 as sql

def init_db():
    print("Iniciando a recriação do banco de dados...")
    
    con = sql.connect('db_prodcumaru.db')
    cur = con.cursor()

    # ==============================================================================
    # 1. CRIAÇÃO DAS TABELAS (ESTRUTURA)
    # ==============================================================================

    # --- CLIENTES FÍSICOS ---
    cur.execute('DROP TABLE IF EXISTS tb_clientes_fisico')
    cur.execute('''
    CREATE TABLE tb_clientes_fisico (
        id_clientes_fisico integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        nome varchar(45) NOT NULL,
        cpf varchar(45) DEFAULT NULL,
        data_nasc varchar(45) NOT NULL,
        email varchar(45) NOT NULL,
        tel_cel varchar(45) NOT NULL,
        data_cad varchar(45) DEFAULT NULL,
        cep varchar(45) NOT NULL,
        logradouro varchar(45) NOT NULL,
        numero varchar(45) NOT NULL,
        bairro varchar(45) NOT NULL,
        cidade varchar(45) NOT NULL,
        estado varchar(45) NOT NULL,
        senha varchar(45) NOT NULL
    )
    ''')

    # --- CLIENTES JURÍDICOS ---
    cur.execute('DROP TABLE IF EXISTS tb_clientes_juridicos')
    cur.execute(''' 
    CREATE TABLE tb_clientes_juridicos (
        id_clientes_juridicos integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        razao_social varchar(45) NOT NULL,
        cnpj varchar(45) NOT NULL,
        email varchar(45) NOT NULL,
        tel_cel varchar(45) NOT NULL,
        cep varchar(45) NOT NULL,
        logradouro varchar(45) NOT NULL,
        numero varchar(45) NOT NULL,
        bairro varchar(45) NOT NULL,
        cidade varchar(45) NOT NULL,
        estado varchar(45) NOT NULL,
        senha varchar(45) NOT NULL,
        data_cad varchar(45) DEFAULT NULL
    )
    ''')

    # --- CONTEÚDO ---
    cur.execute('DROP TABLE IF EXISTS tb_conteudo')
    cur.execute(''' 
    CREATE TABLE tb_conteudo (
        id_conteudo integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        nome_conteudo varchar(45) NOT NULL,
        conteudo varchar(45) NOT NULL,
        data_inclusao date NOT NULL,
        data_exclusao date NOT NULL,
        descricao varchar(45) DEFAULT NULL
    )
    ''')

    # --- CONTRATOS ---
    cur.execute('DROP TABLE IF EXISTS tb_contratos')
    cur.execute(''' 
    CREATE TABLE tb_contratos (
        id_contratos integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        cliente_ass varchar(45) DEFAULT NULL,
        titulo_doc varchar(45) DEFAULT NULL,
        arquivo varchar(45) DEFAULT NULL
    )
    ''')

    # --- FINANÇAS ---
    cur.execute('DROP TABLE IF EXISTS tb_financas')
    cur.execute(''' 
    CREATE TABLE tb_financas (
        id_financas integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        tipo varchar(45) NOT NULL,
        nome varchar(45) DEFAULT NULL,
        cliente_ass varchar(45) DEFAULT NULL,
        obs varchar(45) DEFAULT NULL,
        data_emissao varchar(45) NOT NULL,
        data_vencimento varchar(45) NOT NULL,
        valor_total float NOT NULL,
        status varchar(45) DEFAULT NULL
    )
    ''')

    # --- FUNCIONÁRIOS ---
    cur.execute('DROP TABLE IF EXISTS tb_funcionarios')
    cur.execute(''' 
    CREATE TABLE tb_funcionarios (
        id_funcionarios integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        nome varchar(45) NOT NULL,
        cpf varchar(45) NOT NULL,
        cargo varchar(45) NOT NULL,
        email varchar(45) NOT NULL,
        tel_cel varchar(45) NOT NULL,
        data_admis varchar(45) NOT NULL,
        log_aces varchar(45) NOT NULL,
        senha_aces varchar(45) NOT NULL,
        nivel_aces varchar(45) NOT NULL,
        status varchar(45) NOT NULL,
        obs varchar(45) DEFAULT NULL
    )
    ''')

    # --- AGENDAMENTOS ---
    cur.execute('DROP TABLE IF EXISTS tb_reg_agendamentos')
    cur.execute(''' 
    CREATE TABLE tb_reg_agendamentos (
        id_reg_agendamentos integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        id_cliente integer NOT NULL,
        nome varchar(45) NOT NULL,
        email varchar(45) NOT NULL,
        tel_cel varchar(45) NOT NULL,
        horario varchar(45) NOT NULL,
        data_agend varchar(45) NOT NULL,
        tipo_cliente varchar(45) NOT NULL,
        servico varchar(45) NOT NULL,
        status varchar(45) NOT NULL,
        obs varchar(45) DEFAULT NULL,
        valor_total varchar(45) NOT NULL,
        forma_pagamento varchar(45) NOT NULL,
        status_pagamento varchar(45) NOT NULL
    )
    ''')

    # --- FORMA DE PAGAMENTO ---
    cur.execute('DROP TABLE IF EXISTS tb_forma_pag')
    # Corrigido: Adicionado "CREATE TABLE" que faltava no seu código original
    cur.execute(''' 
    CREATE TABLE tb_forma_pag (
        id_forma_pag integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        nome varchar(45) NOT NULL,
        credito varchar(45) DEFAULT NULL,
        debito varchar(45) DEFAULT NULL,
        pix varchar(45) DEFAULT NULL,
        boleto varchar(45) DEFAULT NULL,
        validade varchar(45) NOT NULL,
        cvv varchar(45) NOT NULL
    )
    ''')

    # --- SERVIÇOS ---
    cur.execute('DROP TABLE IF EXISTS tb_servicos')
    cur.execute(''' 
    CREATE TABLE tb_servicos (
        id_servicos integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        nome_servicos varchar(45) NOT NULL,
        descricao varchar(45) DEFAULT NULL,
        preco varchar(45) DEFAULT NULL,
        duracao_minutos varchar(45) DEFAULT NULL,
        categoria varchar(45) DEFAULT NULL
    )
    ''')

    # --- ITENS PEDIDO ---
    cur.execute('DROP TABLE IF EXISTS tb_itens_pedido')
    cur.execute(''' 
    CREATE TABLE tb_itens_pedido (
        id_itens_pedido integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        id_pedido integer NOT NULL,
        id_produto integer NOT NULL,
        quantidade integer NOT NULL,
        preco_unitario float NOT NULL,
        subtotal float NOT NULL
    )
    ''')

    # --- PEDIDO ---
    cur.execute('DROP TABLE IF EXISTS tb_pedido')
    cur.execute(''' 
    CREATE TABLE tb_pedido (
        id_pedido integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        id_clientes integer DEFAULT NULL,
        data_pedido date NOT NULL,
        nome varchar(65) NOT NULL,
        cpf varchar(45) DEFAULT NULL,
        cnpj varchar(45) DEFAULT NULL,
        cep varchar(45) NOT NULL,
        logradouro varchar(45) NOT NULL,
        numero varchar(45) NOT NULL,
        bairro varchar(45) NOT NULL,
        complemento varchar(45) DEFAULT NULL,
        cidade varchar(45) NOT NULL,
        estado varchar(45) NOT NULL,
        tel_cel varchar(45) NOT NULL,
        email varchar(45) NOT NULL,
        observacao varchar(65) NOT NULL,
        subtotal float NOT NULL,
        frete float NOT NULL,
        valor_total float NOT NULL
    )
    ''')

    # --- PRODUTO ---
    cur.execute('DROP TABLE IF EXISTS tb_produto')
    cur.execute(''' 
    CREATE TABLE tb_produto (
        id_produto integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        nome_produto varchar(45) NOT NULL,
        codigo varchar(45) NOT NULL,
        descricao varchar(45) NOT NULL,
        tamanho varchar(45) NOT NULL,
        estoque varchar(45) NOT NULL,
        preco float NOT NULL,
        foto_prod varchar(45) NOT NULL,
        status varchar(45) NOT NULL,
        data_cad varchar(45) NOT NULL
    )
    ''')

    # ==============================================================================
    # 2. INSERÇÃO DE DADOS DE TESTE - COMENTADO (Use apenas dados reais)
    # ==============================================================================
    
    print("Pulando dados de teste - use apenas dados reais do site")

    # Cliente Físico de exemplo - COMENTADO
    # cur.execute('''
    #     INSERT INTO tb_clientes_fisico (nome, email, tel_cel, data_nasc, cep, logradouro, numero, bairro, cidade, estado, senha)
    #     VALUES ('João Silva', 'joao@email.com', '6199999999', '1990-01-01', '70000000', 'Rua A', '10', 'Asa Sul', 'Brasília', 'DF', '123')
    # ''')

    # Finanças de exemplo - COMENTADO
    # cur.execute("INSERT INTO tb_financas (tipo, nome, valor_total, data_emissao, data_vencimento, status) VALUES ('Receita', 'Podcast João', 550.00, '2025-10-25', '2025-10-25', 'Pago')")
    # cur.execute("INSERT INTO tb_financas (tipo, nome, valor_total, data_emissao, data_vencimento, status) VALUES ('Despesa', 'Energia Elétrica', 200.00, '2025-10-10', '2025-10-15', 'Pago')")

    # Agendamentos de exemplo - COMENTADO
    # cur.execute('''
    #     INSERT INTO tb_reg_agendamentos (id_cliente, nome, email, tel_cel, horario, data_agend, tipo_cliente, servico, status, valor_total, forma_pagamento, status_pagamento) 
    #     VALUES (1, 'João Silva', 'joao@email.com', '6199999999', '14:00', '2025-10-25', 'Fisica', 'Cumaru Standard', 'Confirmado', '550.00', 'Pix', 'Aprovado')
    # ''')

    # Serviços (Para o site carregar)
    cur.execute("INSERT INTO tb_servicos (nome_servicos, preco, duracao_minutos, categoria) VALUES ('CUMARU Básico', '350.00', '60', 'podcast')")
    cur.execute("INSERT INTO tb_servicos (nome_servicos, preco, duracao_minutos, categoria) VALUES ('CUMARU Standard', '550.00', '60', 'podcast')")
    cur.execute("INSERT INTO tb_servicos (nome_servicos, preco, duracao_minutos, categoria) VALUES ('CUMARU Premium', '900.00', '60', 'podcast')")
    
    # Funcionários (Usuários padrão do sistema)
    # Nível 1: Administrador
    cur.execute('''
        INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
        VALUES ('Admin Master', '000.000.000-00', 'Gerente', 'admin@prodcumaru.com', '6199999999', '2025-01-01', 'admin', 'admin123', '1', 'Ativo')
    ''')
    
    # Nível 2: Editor
    cur.execute('''
        INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
        VALUES ('Editor Padrão', '111.111.111-11', 'Editor', 'editor@prodcumaru.com', '6199999999', '2025-01-01', 'editor', 'editor123', '2', 'Ativo')
    ''')
    
    # Nível 3: RH
    cur.execute('''
        INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
        VALUES ('RH Padrão', '222.222.222-22', 'RH', 'rh@prodcumaru.com', '6199999999', '2025-01-01', 'rh', 'rh123', '3', 'Ativo')
    ''')
    
    # Nível 4: Jurídico
    cur.execute('''
        INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
        VALUES ('Jurídico Padrão', '333.333.333-33', 'Jurídico', 'juridico@prodcumaru.com', '6199999999', '2025-01-01', 'juridico', 'juridico123', '4', 'Ativo')
    ''')
    
    # Nível 5: Contabilidade
    cur.execute('''
        INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
        VALUES ('Contabilidade Padrão', '444.444.444-44', 'Contabilidade', 'contabilidade@prodcumaru.com', '6199999999', '2025-01-01', 'contabilidade', 'contabilidade123', '5', 'Ativo')
    ''')

    con.commit()
    con.close()
    print("Banco de dados 'db_prodcumaru.db' recriado com sucesso!")

if __name__ == "__main__":
    init_db()