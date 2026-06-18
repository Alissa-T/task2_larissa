const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os usuários ativos
const listar = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, login, email, situacao FROM usuario WHERE situacao = $1 ORDER BY nome',
      ['ativo']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Criar novo usuário
const criar = async (req, res) => {
  try {
    const { nome, login, senha, email } = req.body;

    if (!nome || !login || !senha || !email) {
      return res.status(400).json({ error: 'Nome, login, senha e email são obrigatórios' });
    }

    // Verificar se login já existe
    const existing = await pool.query('SELECT id FROM usuario WHERE login = $1', [login]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Login já está em uso' });
    }

    // Verificar se email já existe
    const existingEmail = await pool.query("SELECT id FROM usuario WHERE email = $1 AND situacao = 'ativo'", [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuario (nome, login, senha, email, situacao)
       VALUES ($1, $2, $3, $4, 'ativo') RETURNING id, nome, login, email, situacao`,
      [nome, login, senhaHash, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Atualizar usuário
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, login, senha, email } = req.body;

    if (!nome || !login || !email) {
      return res.status(400).json({ error: 'Nome, login e email são obrigatórios' });
    }

    let query, params;

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      query = `UPDATE usuario SET nome = $1, login = $2, senha = $3, email = $4 WHERE id = $5 AND situacao = 'ativo' RETURNING id, nome, login, email, situacao`;
      params = [nome, login, senhaHash, email, id];
    } else {
      query = `UPDATE usuario SET nome = $1, login = $2, email = $3 WHERE id = $4 AND situacao = 'ativo' RETURNING id, nome, login, email, situacao`;
      params = [nome, login, email, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Excluir usuário (soft delete)
const excluir = async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir excluir o próprio usuário
    if (req.session && req.session.usuario && req.session.usuario.id === parseInt(id)) {
      return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    }

    const result = await pool.query(
      `UPDATE usuario SET situacao = 'inativo' WHERE id = $1 AND situacao = 'ativo' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { login: userLogin, senha } = req.body;

    if (!userLogin || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    const result = await pool.query(
      "SELECT * FROM usuario WHERE login = $1 AND situacao = 'ativo'",
      [userLogin]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Login ou senha inválidos' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Login ou senha inválidos' });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
    };

    res.json({
      message: 'Login realizado com sucesso',
      usuario: { id: usuario.id, nome: usuario.nome, login: usuario.login },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

// Logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ message: 'Logout realizado com sucesso' });
  });
};

// Verificar sessão
const verificarSessao = (req, res) => {
  if (req.session && req.session.usuario) {
    return res.json({ logado: true, usuario: req.session.usuario });
  }
  res.json({ logado: false });
};

module.exports = { listar, criar, atualizar, excluir, login, logout, verificarSessao };
