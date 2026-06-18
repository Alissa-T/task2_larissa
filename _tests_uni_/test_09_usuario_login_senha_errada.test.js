jest.mock("../src/config/database", () => ({
	query: jest.fn(),
}));
const pool = require("../src/config/database");
const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcryptjs");

describe("User Unit Test 09", () => {
	test("9. Falha de login por senha totalmente incorreta", async () => {
		const hashed = await bcrypt.hash("correta123", 10);
		pool.query.mockResolvedValueOnce({ rows: [{ id: 1, senha: hashed }] });

		const res = await request(app)
			.post("/api/auth/login")
			.send({ login: "admin", senha: "senhaerrada" });

		expect(res.statusCode).toBe(401);
		expect(res.body.error).toBe("Login ou senha inválidos");
	});
});
