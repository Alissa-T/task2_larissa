-- V3__nova_tabela.sql
-- Tabela de categorias de lancamentos financeiros

CREATE TABLE IF NOT EXISTS categoria (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa', 'ambos')),
  situacao VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categoria (nome, tipo) VALUES
  ('Salario', 'receita'),
  ('Alimentacao', 'despesa'),
  ('Transporte', 'despesa');