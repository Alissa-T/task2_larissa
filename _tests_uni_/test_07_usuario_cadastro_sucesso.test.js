jest.mock("../src/config/database", () => ({
	query: jest.fn(),
}));
const pool = require("../src/config/database");
const request = require("supertest");
const app = require("../server");

describe("User Unit Test 07", () => {
	test("7. Deve criar usuário corretamente realizando hash de senha", async () => {
		pool.query
			.mockResolvedValueOnce({ rows: [] }) // login não existe
			.mockResolvedValueOnce({ rows: [] }) // email não existe
			.mockResolvedValueOnce({
				rows: [{ id: 1, nome: "Test", login: "test" }],
			}); // insert

		const res = await request(app).post("/api/auth/register").send({
			nome: "Test",
			email: "test@mail.com",
			login: "test",
			senha: "123",
		});

		expect(res.statusCode).toBe(201);
		expect(res.body.nome).toBe("Test");
		expect(pool.query).toHaveBeenCalledTimes(3);

		const queryArgs = pool.query.mock.calls[2][1];
		expect(queryArgs.length).toBe(4);
		expect(queryArgs[2]).not.toBe("123");
	});
});
