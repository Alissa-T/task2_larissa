-- V1__create_schema.sql
-- Criação das tabelas principais para o sistema financeiro

CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  login VARCHAR(50) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  email VARCHAR(150),
  situacao VARCHAR(20) DEFAULT 'ativo'
);

CREATE TABLE IF NOT EXISTS lancamento (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  data_lancamento DATE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  tipo_lancamento VARCHAR(20) NOT NULL CHECK (tipo_lancamento IN ('receita', 'despesa')),
  situacao VARCHAR(20) DEFAULT 'ativo'
);
