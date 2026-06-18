jest.mock("../src/config/database", () => ({
	query: jest.fn(),
}));
const pool = require("../src/config/database");
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcryptjs");

describe("User Unit Test 10", () => {
	test("10. Sucesso de login deve estabelecer sessão", async () => {
		const hashed = await bcrypt.hash("senha123", 10);
		pool.query.mockResolvedValueOnce({
			rows: [
				{
					id: 99,
					nome: "John",
					login: "john",
					email: "john@ma.com",
					senha: hashed,
				},
			],
		});

		const res = await request(app)
			.post("/api/auth/login")
			.send({ login: "john", senha: "senha123" });

		expect(res.statusCode).toBe(200);
		expect(res.body.message).toContain("Login realizado");
		expect(res.body.usuario.id).toBe(99);
	});
});
