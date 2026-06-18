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

describe("Lancamento Unit Test 11", () => {
	test("11. Listar lançamentos retorna array vazio se não houver dados", async () => {
		const request = require("supertest");
		pool.query.mockResolvedValueOnce({ rows: [] });
		const res = await request(app).get("/api/lancamentos");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual([]);
	});
});
