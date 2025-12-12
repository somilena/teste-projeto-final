-- Schema Postgres para ProdCumaru (equivalente ao init_db.py)
-- Ajuste conforme necessário; tipos otimizados para Postgres

-- CLIENTES FISICOS
DROP TABLE IF EXISTS tb_clientes_fisico CASCADE;
CREATE TABLE tb_clientes_fisico (
  id_clientes_fisico SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(45),
  data_nasc DATE NOT NULL,
  email VARCHAR(100) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  data_cad DATE DEFAULT CURRENT_DATE,
  cep VARCHAR(20) NOT NULL,
  logradouro VARCHAR(120) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  bairro VARCHAR(80) NOT NULL,
  cidade VARCHAR(80) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  senha VARCHAR(200) NOT NULL,
  CONSTRAINT uq_clientes_fisico_email UNIQUE (email),
  CONSTRAINT uq_clientes_fisico_cpf UNIQUE (cpf),
  CONSTRAINT chk_clientes_fisico_estado CHECK (estado ~ '^[A-Z]{2}$')
);

-- CLIENTES JURIDICOS
DROP TABLE IF EXISTS tb_clientes_juridicos CASCADE;
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
  senha VARCHAR(200) NOT NULL,
  data_cad DATE DEFAULT CURRENT_DATE,
  CONSTRAINT uq_clientes_juridicos_email UNIQUE (email),
  CONSTRAINT uq_clientes_juridicos_cnpj UNIQUE (cnpj),
  CONSTRAINT chk_clientes_juridicos_estado CHECK (estado ~ '^[A-Z]{2}$')
);

-- CONTEUDO
DROP TABLE IF EXISTS tb_conteudo CASCADE;
CREATE TABLE tb_conteudo (
  id_conteudo SERIAL PRIMARY KEY,
  nome_conteudo VARCHAR(100) NOT NULL,
  conteudo TEXT NOT NULL,
  data_inclusao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_exclusao DATE,
  descricao VARCHAR(200)
);

-- CONTRATOS
DROP TABLE IF EXISTS tb_contratos CASCADE;
CREATE TABLE tb_contratos (
  id_contratos SERIAL PRIMARY KEY,
  cliente_ass VARCHAR(120),
  titulo_doc VARCHAR(120),
  arquivo VARCHAR(200)
);

-- FINANCAS
DROP TABLE IF EXISTS tb_financas CASCADE;
CREATE TABLE tb_financas (
  id_financas SERIAL PRIMARY KEY,
  tipo VARCHAR(45) NOT NULL,
  nome VARCHAR(120),
  cliente_ass VARCHAR(120),
  obs VARCHAR(200),
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  valor_total NUMERIC(12,2) NOT NULL,
  status VARCHAR(45)
);

-- FUNCIONARIOS
DROP TABLE IF EXISTS tb_funcionarios CASCADE;
CREATE TABLE tb_funcionarios (
  id_funcionarios SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cpf VARCHAR(20) NOT NULL,
  cargo VARCHAR(60) NOT NULL,
  email VARCHAR(100) NOT NULL,
  tel_cel VARCHAR(45) NOT NULL,
  data_admis DATE NOT NULL DEFAULT CURRENT_DATE,
  log_aces VARCHAR(45) NOT NULL,
  senha_aces VARCHAR(200) NOT NULL,
  nivel_aces SMALLINT NOT NULL,
  status VARCHAR(45) NOT NULL,
  obs VARCHAR(200)
  ,CONSTRAINT uq_funcionarios_email UNIQUE (email)
  ,CONSTRAINT uq_funcionarios_cpf UNIQUE (cpf)
  ,CONSTRAINT chk_funcionarios_nivel CHECK (nivel_aces BETWEEN 1 AND 5)
  ,CONSTRAINT chk_funcionarios_status CHECK (status IN ('Ativo','Inativo'))
);

-- REGISTRO DE AGENDAMENTOS
DROP TABLE IF EXISTS tb_reg_agendamentos CASCADE;
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
  -- FK para clientes será opcional dependendo do modelo (fisico/juridico)
);

-- FORMA DE PAGAMENTO
DROP TABLE IF EXISTS tb_forma_pag CASCADE;
CREATE TABLE tb_forma_pag (
  id_forma_pag SERIAL PRIMARY KEY,
  nome VARCHAR(45) NOT NULL,
  credito VARCHAR(45),
  debito VARCHAR(45),
  pix VARCHAR(45),
  boleto VARCHAR(45),
  validade VARCHAR(10),
  cvv VARCHAR(10)
);

-- SERVICOS
DROP TABLE IF EXISTS tb_servicos CASCADE;
CREATE TABLE tb_servicos (
  id_servicos SERIAL PRIMARY KEY,
  nome_servicos VARCHAR(120) NOT NULL,
  descricao VARCHAR(200),
  preco NUMERIC(12,2),
  duracao_minutos INTEGER,
  categoria VARCHAR(45)
  ,CONSTRAINT uq_servicos_nome UNIQUE (nome_servicos)
);

-- ITENS PEDIDO
DROP TABLE IF EXISTS tb_itens_pedido CASCADE;
CREATE TABLE tb_itens_pedido (
  id_itens_pedido SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL,
  id_produto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
  ,CONSTRAINT fk_itens_pedido_pedido FOREIGN KEY (id_pedido) REFERENCES tb_pedido(id_pedido) ON DELETE CASCADE
  ,CONSTRAINT fk_itens_pedido_produto FOREIGN KEY (id_produto) REFERENCES tb_produto(id_produto)
  ,CONSTRAINT chk_itens_pedido_quantidade CHECK (quantidade > 0)
);

-- PEDIDO
DROP TABLE IF EXISTS tb_pedido CASCADE;
CREATE TABLE tb_pedido (
  id_pedido SERIAL PRIMARY KEY,
  id_clientes INTEGER,
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
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
  ,CONSTRAINT chk_pedido_estado CHECK (estado ~ '^[A-Z]{2}$')
  ,CONSTRAINT chk_pedido_valores CHECK (subtotal >= 0 AND frete >= 0 AND valor_total >= 0)
);

-- PRODUTO
DROP TABLE IF EXISTS tb_produto CASCADE;
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
  data_cad DATE NOT NULL DEFAULT CURRENT_DATE
  ,CONSTRAINT uq_produto_codigo UNIQUE (codigo)
  ,CONSTRAINT chk_produto_estoque CHECK (estoque >= 0)
  ,CONSTRAINT chk_produto_preco CHECK (preco >= 0)
);

-- Índices para performance em filtros comuns
CREATE INDEX IF NOT EXISTS idx_produto_nome ON tb_produto (nome_produto);
CREATE INDEX IF NOT EXISTS idx_pedido_data ON tb_pedido (data_pedido);
CREATE INDEX IF NOT EXISTS idx_agend_data_status ON tb_reg_agendamentos (data_agend, status);

-- ============================================================================
-- INSERÇÃO DE DADOS DE TESTE
-- ============================================================================

-- Serviços (Para o site carregar)
INSERT INTO tb_servicos (nome_servicos, preco, duracao_minutos, categoria) 
VALUES ('CUMARU Básico', 350.00, 60, 'podcast');

INSERT INTO tb_servicos (nome_servicos, preco, duracao_minutos, categoria) 
VALUES ('CUMARU Standard', 550.00, 60, 'podcast');

INSERT INTO tb_servicos (nome_servicos, preco, duracao_minutos, categoria) 
VALUES ('CUMARU Premium', 900.00, 60, 'podcast');

-- Funcionários (Usuários padrão do sistema)
-- Nível 1: Administrador
INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
VALUES ('Admin Master', '000.000.000-00', 'Gerente', 'admin@prodcumaru.com', '6199999999', CURRENT_DATE, 'admin', 'admin123', '1', 'Ativo');

-- Nível 2: Editor
INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
VALUES ('Editor Padrão', '111.111.111-11', 'Editor', 'editor@prodcumaru.com', '6199999999', CURRENT_DATE, 'editor', 'editor123', '2', 'Ativo');

-- Nível 3: RH
INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
VALUES ('RH Padrão', '222.222.222-22', 'RH', 'rh@prodcumaru.com', '6199999999', CURRENT_DATE, 'rh', 'rh123', '3', 'Ativo');

-- Nível 4: Jurídico
INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
VALUES ('Jurídico Padrão', '333.333.333-33', 'Jurídico', 'juridico@prodcumaru.com', '6199999999', CURRENT_DATE, 'juridico', 'juridico123', '4', 'Ativo');

-- Nível 5: Contabilidade
INSERT INTO tb_funcionarios (nome, cpf, cargo, email, tel_cel, data_admis, log_aces, senha_aces, nivel_aces, status)
VALUES ('Contabilidade Padrão', '444.444.444-44', 'Contabilidade', 'contabilidade@prodcumaru.com', '6199999999', CURRENT_DATE, 'contabilidade', 'contabilidade123', '5', 'Ativo');
