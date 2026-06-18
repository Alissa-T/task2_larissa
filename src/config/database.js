const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT, 10) || 5432,
	user: process.env.DB_USER || "postgres",
	password: process.env.DB_PASSWORD || "postgres",
	database: process.env.DB_NAME || "financeiro_db",
});

pool.on("connect", () => {
	console.log("✅ Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
	console.error("❌ Erro na conexão com PostgreSQL:", err);
});

module.exports = pool;
