import sqlite3 as sql

# Conectar ao banco de dados (ou criar se não existir)
con = sql.connect('db_prodcumaru.db')
cur = con.cursor()

# Criar a tabela 'tb_clientes_fisico'
cur.execute('DROP TABLE IF EXISTS tb_clientes_fisico')

sql_clientes_fisico = '''
CREATE TABLE tb_clientes_fisico (
  id_clientes_fisico int NOT NULL PRIMARY KEY AUTOINCREMENT,
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
'''
cur.execute(sql_clientes_fisico)

# Criar a tabela 'tb_clientes_juridicos'
cur.execute('DROP TABLE IF EXISTS tb_clientes_juridicos')

sql_clientes_juridicos = ''' 
CREATE TABLE tb_clientes_juridicos (
  id_clientes_juridicos int NOT NULL PRIMARY KEY AUTOINCREMENT,
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
'''

cur.execute(sql_clientes_juridicos)

# Criar a tabela 'tb_conteudo'
cur.execute('DROP TABLE IF EXISTS tb_conteudo')

sql_conteudo = ''' 
CREATE TABLE tb_conteudo (
  id_conteudo int NOT NULL PRIMARY KEY AUTOINCREMENT,
  nome_conteudo varchar(45) NOT NULL,
  conteudo varchar(45) NOT NULL,
  data_inclusao date NOT NULL,
  data_exclusao date NOT NULL,
  descricao varchar(45) DEFAULT NULL
'''

cur.execute(sql_conteudo)

# Criar a tabela 'tb_contratos'
cur.execute('DROP TABLE IF EXISTS tb_contratos')

sql_contratos = ''' 
CREATE TABLE tb_contratos (
  id_contratos int NOT NULL PRIMARY KEY AUTOINCREMENT,
  cliente_ass varchar(45) DEFAULT NULL,
  titulo_doc varchar(45) DEFAULT NULL,
  arquivo varchar(45) DEFAULT NULL
'''

cur.execute(sql_contratos)

# Criar a tabela 'tb_financas'
cur.execute('DROP TABLE IF EXISTS tb_financas')

sql_financas = ''' 
CREATE TABLE tb_financas (
  id_financas int NOT NULL PRIMARY KEY AUTOINCREMENT,
  tipo varchar(45) NOT NULL,
  nome varchar(45) DEFAULT NULL,
  cliente_ass varchar(45) DEFAULT NULL,
  obs varchar(45) DEFAULT NULL,
  data_emissao varchar(45) NOT NULL,
  data_vencimento varchar(45) NOT NULL,
  valor_total float NOT NULL,
  status varchar(45) DEFAULT NULL


'''

cur.execute(sql_financas)

# Criar a tabela 'tb_funcionarios'
cur.execute('DROP TABLE IF EXISTS tb_funcionarios')

sql_funcionarios = ''' 
CREATE TABLE tb_funcionarios (
  id_funcionarios int NOT NULL PRIMARY KEY AUTOINCREMENT,
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
'''

cur.execute(sql_funcionarios)

# Criar a tabela 'tb_reg_agendamentos'
cur.execute('DROP TABLE IF EXISTS tb_reg_agendamentos')

sql_reg_agendamentos = ''' 

CREATE TABLE tb_reg_agendamentos (
  id_reg_agendamentos int NOT NULL PRIMARY KEY AUTOINCREMENT,
  id_cliente int NOT NULL,
  nome varchar(45) NOT NULL,
  email varchar(45) NOT NULL,
  tel_cel varchar(45) NOT NULL,
  horario varchar(45) NOT NULL,
  data_agend varchar(45) NOT NULL,
  tipo_cliente varchar(45) NOT NULL,
  servico varchar(45) NOT NULL,
  status varchar(45) NOT NULL,
  obs varchar(45) NOT NULL,
  valor_total varchar(45) NOT NULL,
  forma_pagamento varchar(45) NOT NULL,
  status_pagamento varchar(45) NOT NULL

'''

cur.execute(sql_reg_agendamentos)

# Criar a tabela 'tb_forma_pag'
cur.execute('DROP TABLE IF EXISTS tb_forma_pag')

sql_forma_pag = ''' 

tb_forma_pag (
  id_forma_pag int NOT NULL PRIMARY KEY AUTOINCREMENT,
  nome varchar(45) NOT NULL,
  credito varchar(45) DEFAULT NULL,
  debito varchar(45) DEFAULT NULL,
  pix varchar(45) DEFAULT NULL,
  boleto varchar(45) DEFAULT NULL,
  validade varchar(45) NOT NULL,
  cvv varchar(45) NOT NULL

'''

cur.execute(sql_forma_pag)

# Criar a tabela 'tb_servicos'
cur.execute('DROP TABLE IF EXISTS tb_servicos')

sql_servicos = ''' 

CREATE TABLE tb_servicos (
  id_servicos int NOT NULL PRIMARY KEY AUTOINCREMENT,
  nome_servicos varchar(45) NOT NULL,
  descricao varchar(45) DEFAULT NULL,
  preco varchar(45) DEFAULT NULL,
  duracao_minutos varchar(45) DEFAULT NULL,
  categoria varchar(45) DEFAULT NULL,

'''

cur.execute(sql_servicos)

# Criar a tabela 'tb_itens_pedido'
cur.execute('DROP TABLE IF EXISTS tb_itens_pedido')

sql_itens_pedido = ''' 

CREATE TABLE tb_itens_pedido (
  id_itens_pedido int NOT NULL PRIMARY KEY AUTOINCREMENT,
  id_pedido int NOT NULL,
  id_produto int NOT NULL,
  quantidade int NOT NULL,
  preco_unitario float NOT NULL,
  subtotal float NOT NULL

'''

cur.execute(sql_itens_pedido)

# Criar a tabela 'tb_pedido'
cur.execute('DROP TABLE IF EXISTS tb_pedido')

sql_pedido = ''' 

CREATE TABLE tb_pedido (
  id_pedido int NOT NULL PRIMARY KEY AUTOINCREMENT,
  id_clientes int DEFAULT NULL,
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

'''

cur.execute(sql_pedido)

# Criar a tabela 'tb_produto'
cur.execute('DROP TABLE IF EXISTS tb_produto')

sql_produto = ''' 

CREATE TABLE tb_produto (
  id_produto int NOT NULL PRIMARY KEY AUTOINCREMENT,
  nome_produto varchar(45) NOT NULL,
  codigo varchar(45) NOT NULL,
  descricao varchar(45) NOT NULL,
  tamanho varchar(45) NOT NULL,
  estoque varchar(45) NOT NULL,
  preco float NOT NULL,
  foto_prod varchar(45) NOT NULL,
  status varchar(45) NOT NULL,
  data_cad varchar(45) NOT NULL

'''

cur.execute(sql_produto)

con.commit()
con.close()
