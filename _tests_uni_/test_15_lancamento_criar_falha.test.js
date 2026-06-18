let app;

beforeAll(() => {
	jest.isolateModules(() => {
		jest.mock("../src/config/database", () => ({ query: jest.fn() }));
		jest.mock("../src/middleware/auth", () => (req, _res, next) => {
			req.session = {
				usuario: { id: 1, nome: "Admin", email: "admin@test.com" },
			};
			next();
		});
		app = require("../server");
	});
});

describe("Lancamento Unit Test 15", () => {
	test("15. Falha ao tentar Criar um lançamento sem dados obrigatórios", async () => {
		const request = require("supertest");
		const res = await request(app)
			.post("/api/lancamentos")
			.send({ descricao: "Luz" });
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toContain("obrigatórios");
	});
});
