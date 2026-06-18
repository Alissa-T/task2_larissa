jest.mock("../src/config/database", () => ({
	query: jest.fn(),
}));
const pool = require("../src/config/database");
const request = require("supertest");
const app = require("../server");

describe("User Unit Test 08", () => {
	test("8. Falha de login por usuário que não existe", async () => {
		pool.query.mockResolvedValueOnce({ rows: [] });

		const res = await request(app)
			.post("/api/auth/login")
			.send({ login: "ghost", senha: "123" });

		expect(res.statusCode).toBe(401);
		expect(res.body.error).toBe("Login ou senha inválidos");
	});
});
