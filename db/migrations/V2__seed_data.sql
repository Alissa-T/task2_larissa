-- V2__seed_data.sql
-- Inserção de dados iniciais (admin e lançamentos)

-- Cria o usuário administrador se não existir (senha: admin123)
INSERT INTO usuario (nome, login, senha, email, situacao)
VALUES ('Administrador', 'admin', '$2a$10$I8xN.KzKFYUCIsaNn29ZPeCX0HawlPc5mfnBsxOSH8zn5IczdX4Ny', 'admin@financeiro.com', 'ativo')
ON CONFLICT (login) DO NOTHING;

-- Limpa lançamentos existentes para evitar duplicidade no seed
DELETE FROM lancamento;

-- Insere os 10 lançamentos padrão do projeto
INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao) VALUES
('Salário mensal', '2026-03-01', 5500.00, 'receita', 'ativo'),
('Freelance - projeto web', '2026-03-05', 2800.00, 'receita', 'ativo'),
('Aluguel do apartamento', '2026-03-05', 1800.00, 'despesa', 'ativo'),
('Conta de energia', '2026-03-10', 245.50, 'despesa', 'ativo'),
('Supermercado', '2026-03-12', 687.30, 'despesa', 'ativo'),
('Venda de produto online', '2026-03-14', 450.00, 'receita', 'ativo'),
('Internet e telefone', '2026-03-15', 159.90, 'despesa', 'ativo'),
('Combustível', '2026-03-18', 320.00, 'despesa', 'ativo'),
('Rendimento investimentos', '2026-03-20', 185.75, 'receita', 'ativo'),
('Manutenção do carro', '2026-03-22', 530.00, 'despesa', 'ativo');
