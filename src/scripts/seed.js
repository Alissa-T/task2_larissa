const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conexão sem database para criar o banco
const poolAdmin = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres',
});

const dbName = process.env.DB_NAME || 'financeiro_db';

async function seed() {
  let client;

  try {
    // 1. Criar banco de dados se não existir
    client = await poolAdmin.connect();
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Banco de dados "${dbName}" criado com sucesso!`);
    } else {
      console.log(`ℹ️  Banco de dados "${dbName}" já existe.`);
    }
    client.release();
    await poolAdmin.end();

    // 2. Conectar ao banco criado
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName,
    });

    // 3. Criar tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        login VARCHAR(50) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        email VARCHAR(150),
        situacao VARCHAR(20) DEFAULT 'ativo'
      );
    `);

    // Adicionar coluna email se não existir (para bases já criadas)
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE usuario ADD COLUMN IF NOT EXISTS email VARCHAR(150);
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `);

    console.log('✅ Tabela "usuario" criada/verificada.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lancamento (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        data_lancamento DATE NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        tipo_lancamento VARCHAR(20) NOT NULL CHECK (tipo_lancamento IN ('receita', 'despesa')),
        situacao VARCHAR(20) DEFAULT 'ativo'
      );
    `);
    console.log('✅ Tabela "lancamento" criada/verificada.');

    // 4. Popular tabela usuario (1 usuário)
    const senhaHash = await bcrypt.hash('admin123', 10);

    await pool.query(`
      INSERT INTO usuario (nome, login, senha, email, situacao)
      VALUES ($1, $2, $3, $4, 'ativo')
      ON CONFLICT (login) DO UPDATE SET senha = $3, email = $4
    `, ['Administrador', 'admin', senhaHash, 'admin@financeiro.com']);
    console.log('✅ Usuário "admin" criado/atualizado. Senha: admin123');

    // 5. Popular tabela lancamento com 10 registros
    await pool.query('DELETE FROM lancamento');

    const lancamentos = [
      ['Salário mensal', '2026-03-01', 5500.00, 'receita'],
      ['Freelance - projeto web', '2026-03-05', 2800.00, 'receita'],
      ['Aluguel do apartamento', '2026-03-05', 1800.00, 'despesa'],
      ['Conta de energia', '2026-03-10', 245.50, 'despesa'],
      ['Supermercado', '2026-03-12', 687.30, 'despesa'],
      ['Venda de produto online', '2026-03-14', 450.00, 'receita'],
      ['Internet e telefone', '2026-03-15', 159.90, 'despesa'],
      ['Combustível', '2026-03-18', 320.00, 'despesa'],
      ['Rendimento investimentos', '2026-03-20', 185.75, 'receita'],
      ['Manutenção do carro', '2026-03-22', 530.00, 'despesa'],
    ];

    for (const [descricao, data, valor, tipo] of lancamentos) {
      await pool.query(
        `INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao)
         VALUES ($1, $2, $3, $4, 'ativo')`,
        [descricao, data, valor, tipo]
      );
    }

    console.log('✅ 10 lançamentos inseridos com sucesso!');
    console.log('');
    console.log('📋 Resumo dos lançamentos:');
    console.log('─────────────────────────────────────────');

    const result = await pool.query('SELECT * FROM lancamento ORDER BY data_lancamento');
    result.rows.forEach((row) => {
      const tipo = row.tipo_lancamento === 'receita' ? '💰' : '💸';
      console.log(
        `  ${tipo} ${row.descricao}: R$ ${parseFloat(row.valor).toFixed(2)} (${row.data_lancamento.toISOString().split('T')[0]})`
      );
    });

    console.log('─────────────────────────────────────────');
    console.log('');
    console.log('🎉 Seed concluído com sucesso!');
    console.log('📌 Credenciais de acesso:');
    console.log('   Login: admin');
    console.log('   Senha: admin123');

    await pool.end();
  } catch (error) {
    console.error('❌ Erro no seed:', error.message);
    process.exit(1);
  }
}

seed();
