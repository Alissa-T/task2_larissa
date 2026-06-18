const pool = require("../config/database");
const emailService = require("../utils/emailService");
const {
	templateCriacao,
	templateEdicao,
	templateExclusao,
} = require("../utils/emailTemplate");

const sendLancamentoEmail = async (userId, subject, message, html) => {
	if (!userId) return;
	try {
		const userRes = await pool.query(
			"SELECT email FROM usuario WHERE id = $1",
			[userId],
		);
		const userEmail = userRes.rows[0]?.email;
		if (userEmail) {
			emailService.sendEmail(userEmail, subject, message, html);
		}
	} catch (error) {
		console.error("Erro ao buscar email do usuario para notificação:", error);
	}
};

// Listar todos os lançamentos ativos
const listar = async (_req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM lancamento WHERE situacao = $1 ORDER BY data_lancamento DESC",
			["ativo"],
		);
		res.json(result.rows);
	} catch (error) {
		console.error("Erro ao listar lançamentos:", error);
		res.status(500).json({ error: "Erro ao buscar lançamentos" });
	}
};

// Buscar lançamento por ID
const buscarPorId = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			"SELECT * FROM lancamento WHERE id = $1 AND situacao = 'ativo'",
			[id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Lançamento não encontrado" });
		}
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Erro ao buscar lançamento:", error);
		res.status(500).json({ error: "Erro ao buscar lançamento" });
	}
};

// Criar novo lançamento
const criar = async (req, res) => {
	try {
		const { descricao, data_lancamento, valor, tipo_lancamento } = req.body;

		if (!descricao || !data_lancamento || !valor || !tipo_lancamento) {
			return res
				.status(400)
				.json({ error: "Todos os campos são obrigatórios" });
		}

		if (!["receita", "despesa"].includes(tipo_lancamento)) {
			return res
				.status(400)
				.json({ error: 'Tipo de lançamento deve ser "receita" ou "despesa"' });
		}

		const result = await pool.query(
			`INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao)
       VALUES ($1, $2, $3, $4, 'ativo') RETURNING *`,
			[descricao, data_lancamento, valor, tipo_lancamento],
		);

		sendLancamentoEmail(
			req.session.usuario.id,
			"Lançamento registrado",
			`Lançamento registrado: "${descricao}" - Valor: R$ ${valor}`,
			templateCriacao(result.rows[0]),
		);

		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error("Erro ao criar lançamento:", error);
		res.status(500).json({ error: "Erro ao criar lançamento" });
	}
};

// Atualizar lançamento
const atualizar = async (req, res) => {
	try {
		const { id } = req.params;
		const { descricao, data_lancamento, valor, tipo_lancamento } = req.body;

		if (!descricao || !data_lancamento || !valor || !tipo_lancamento) {
			return res
				.status(400)
				.json({ error: "Todos os campos são obrigatórios" });
		}

		const lancAntes = await pool.query(
			"SELECT * FROM lancamento WHERE id = $1 AND situacao = 'ativo'",
			[id],
		);
		if (lancAntes.rows.length === 0) {
			return res.status(404).json({ error: "Lançamento não encontrado" });
		}
		const antes = lancAntes.rows[0];

		const result = await pool.query(
			`UPDATE lancamento SET descricao = $1, data_lancamento = $2, valor = $3, tipo_lancamento = $4
       WHERE id = $5 AND situacao = 'ativo' RETURNING *`,
			[descricao, data_lancamento, valor, tipo_lancamento, id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Lançamento não encontrado" });
		}

		sendLancamentoEmail(
			req.session.usuario.id,
			"Lançamento atualizado",
			`Lançamento editado: "${descricao}" - Novo valor: R$ ${valor}`,
			templateEdicao(antes, result.rows[0]),
		);

		res.json(result.rows[0]);
	} catch (error) {
		console.error("Erro ao atualizar lançamento:", error);
		res.status(500).json({ error: "Erro ao atualizar lançamento" });
	}
};

// Excluir lançamento (soft delete)
const excluir = async (req, res) => {
	try {
		const { id } = req.params;

		const result = await pool.query(
			`UPDATE lancamento SET situacao = 'inativo' WHERE id = $1 AND situacao = 'ativo' RETURNING *`,
			[id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Lançamento não encontrado" });
		}

		sendLancamentoEmail(
			req.session.usuario.id,
			"Lançamento excluído",
			`Lançamento excluído: "${result.rows[0].descricao}" - Valor: R$ ${result.rows[0].valor}`,
			templateExclusao(result.rows[0]),
		);

		res.json({ message: "Lançamento excluído com sucesso" });
	} catch (error) {
		console.error("Erro ao excluir lançamento:", error);
		res.status(500).json({ error: "Erro ao excluir lançamento" });
	}
};

// Obter resumo financeiro
const resumo = async (_req, res) => {
	try {
		const result = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN tipo_lancamento = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN tipo_lancamento = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN tipo_lancamento = 'receita' THEN valor ELSE -valor END), 0) as saldo
      FROM lancamento WHERE situacao = 'ativo'
    `);
		res.json(result.rows[0]);
	} catch (error) {
		console.error("Erro ao buscar resumo:", error);
		res.status(500).json({ error: "Erro ao buscar resumo financeiro" });
	}
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir, resumo };
