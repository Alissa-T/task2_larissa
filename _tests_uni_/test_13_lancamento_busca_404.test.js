let app;
let pool;

beforeAll(() => {
	jest.isolateModules(() => {
		jest.mock("../src/config/database", () => ({ query: jest.fn() }));
		jest.mock("../src/middleware/auth", () => (req, _res, next) => {
			req.session = {
				usuario: { id: 1, nome: "Admin", email: "admin@test.com" },
			};
			next();
		});
		pool = require("../src/config/database");
		app = require("../server");
	});
});

describe("Lancamento Unit Test 13", () => {
	test("13. Busca de lançamento por ID deve retornar 404 se não existir", async () => {
		const request = require("supertest");
		pool.query.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/lancamentos/99");
		expect(res.statusCode).toBe(404);
	});
});
