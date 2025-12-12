-- Schema Postgres para ProdCumaru (equivalente ao init_db.py)
-- Ajuste conforme necessário; tipos otimizados para Postgres

-- CLIENTES FISICOS
DROP TABLE IF EXISTS tb_clientes_fisico;
CREATE TABLE tb_clientes_fisico (
  id_clientes_fisico SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(45),
  data_nasc DATE NOT NULL,
  email VARCHAR(100) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  data_cad DATE,
  cep VARCHAR(20) NOT NULL,
  logradouro VARCHAR(120) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  cidade VARCHAR(80) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  senha VARCHAR(100) NOT NULL
);

-- CLIENTES JURIDICOS
DROP TABLE IF EXISTS tb_clientes_juridicos;
CREATE TABLE tb_clientes_juridicos (
  id_clientes_juridicos SERIAL PRIMARY KEY,
  razao_social VARCHAR(120) NOT NULL,
  cnpj VARCHAR(45) NOT NULL,
  email VARCHAR(100) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  cep VARCHAR(20) NOT NULL,
  logradouro VARCHAR(120) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  cidade VARCHAR(80) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  senha VARCHAR(100) NOT NULL,
  data_cad DATE
);

-- CONTEUDO
DROP TABLE IF EXISTS tb_conteudo;
CREATE TABLE tb_conteudo (
  id_conteudo SERIAL PRIMARY KEY,
  nome_conteudo VARCHAR(100) NOT NULL,
  conteudo TEXT NOT NULL,
  data_inclusao DATE NOT NULL,
  data_exclusao DATE,
  descricao VARCHAR(200)
);

-- CONTRATOS
DROP TABLE IF EXISTS tb_contratos;
CREATE TABLE tb_contratos (
  id_contratos SERIAL PRIMARY KEY,
  cliente_ass VARCHAR(120),
  titulo_doc VARCHAR(120),
  arquivo VARCHAR(200)
);

-- FINANCAS
DROP TABLE IF EXISTS tb_financas;
CREATE TABLE tb_financas (
  id_financas SERIAL PRIMARY KEY,
  tipo VARCHAR(45) NOT NULL,
  nome VARCHAR(120),
  cliente_ass VARCHAR(120),
  obs VARCHAR(200),
  data_emissao DATE NOT NULL,
  data_vencimento DATE,
  valor_total NUMERIC(12,2) NOT NULL,
  status VARCHAR(45)
);

-- FUNCIONARIOS
DROP TABLE IF EXISTS tb_funcionarios;
CREATE TABLE tb_funcionarios (
  id_funcionarios SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cpf VARCHAR(20) NOT NULL,
  cargo VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  data_admis DATE NOT NULL,
  log_aces VARCHAR(45) NOT NULL,
  senha_aces VARCHAR(100) NOT NULL,
  nivel_aces VARCHAR(45) NOT NULL,
  status VARCHAR(45) NOT NULL,
  obs VARCHAR(200)
);

-- REGISTRO DE AGENDAMENTOS
DROP TABLE IF EXISTS tb_reg_agendamentos;
CREATE TABLE tb_reg_agendamentos (
  id_reg_agendamentos SERIAL PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(100) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  horario VARCHAR(10) NOT NULL,
  data_agend DATE NOT NULL,
  tipo_cliente VARCHAR(10) NOT NULL,
  servico VARCHAR(120) NOT NULL,
  status VARCHAR(45) NOT NULL,
  obs VARCHAR(200),
  valor_total NUMERIC(12,2) NOT NULL,
  forma_pagamento VARCHAR(45) NOT NULL,
  status_pagamento VARCHAR(45) NOT NULL
);

-- FORMA DE PAGAMENTO
DROP TABLE IF EXISTS tb_forma_pag;
CREATE TABLE tb_forma_pag (
  id_forma_pag SERIAL PRIMARY KEY,
  nome VARCHAR(45) NOT NULL,
  credito VARCHAR(45),
  debito VARCHAR(45),
  pix VARCHAR(45),
  boleto VARCHAR(45),
  validade VARCHAR(10) NOT NULL,
  cvv VARCHAR(10) NOT NULL
);

-- SERVICOS
DROP TABLE IF EXISTS tb_servicos;
CREATE TABLE tb_servicos (
  id_servicos SERIAL PRIMARY KEY,
  nome_servicos VARCHAR(120) NOT NULL,
  descricao VARCHAR(200),
  preco NUMERIC(12,2),
  duracao_minutos INTEGER,
  categoria VARCHAR(45)
);

-- ITENS PEDIDO
DROP TABLE IF EXISTS tb_itens_pedido;
CREATE TABLE tb_itens_pedido (
  id_itens_pedido SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL,
  id_produto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

-- PEDIDO
DROP TABLE IF EXISTS tb_pedido;
CREATE TABLE tb_pedido (
  id_pedido SERIAL PRIMARY KEY,
  id_clientes INTEGER,
  data_pedido DATE NOT NULL,
  nome VARCHAR(120) NOT NULL,
  cpf VARCHAR(20),
  cnpj VARCHAR(20),
  cep VARCHAR(20) NOT NULL,
  logradouro VARCHAR(120) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  complemento VARCHAR(120),
  cidade VARCHAR(80) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  email VARCHAR(100) NOT NULL,
  observacao VARCHAR(200) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  frete NUMERIC(12,2) NOT NULL,
  valor_total NUMERIC(12,2) NOT NULL
);

-- PRODUTO
DROP TABLE IF EXISTS tb_produto;
CREATE TABLE tb_produto (
  id_produto SERIAL PRIMARY KEY,
  nome_produto VARCHAR(120) NOT NULL,
  codigo VARCHAR(45) NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  tamanho VARCHAR(45) NOT NULL,
  estoque INTEGER NOT NULL,
  preco NUMERIC(12,2) NOT NULL,
  foto_prod VARCHAR(200) NOT NULL,
  status VARCHAR(45) NOT NULL,
  data_cad DATE NOT NULL
);
