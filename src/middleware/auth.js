const authMiddleware = (req, res, next) => {
	if (req.session?.usuario) {
		return next();
	}
	return res
		.status(401)
		.json({ error: "Não autorizado. Faça login para continuar." });
};

module.exports = authMiddleware;
