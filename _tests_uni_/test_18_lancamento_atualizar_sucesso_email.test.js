let app;
let pool;
let emailSvc;

beforeAll(() => {
	jest.isolateModules(() => {
		jest.mock("../src/config/database", () => ({ query: jest.fn() }));
		jest.mock("../src/middleware/auth", () => (req, _res, next) => {
			req.session = {
				usuario: { id: 1, nome: "Admin", email: "admin@test.com" },
			};
			next();
		});
		jest.mock("../src/utils/emailService", () => ({
			sendEmail: jest.fn().mockResolvedValue(true),
		}));
		pool = require("../src/config/database");
		emailSvc = require("../src/utils/emailService");
		app = require("../server");
	});
});

describe("Lancamento Unit Test 18", () => {
	test("18. Sucesso ao Atualizar e notifica email de Antes e Depois", async () => {
		const request = require("supertest");
		const mOld = {
			id: 10,
			descricao: "Gas",
			valor: 60,
			tipo_lancamento: "despesa",
			situacao: "ativo",
		};
		pool.query
			.mockResolvedValueOnce({ rows: [mOld] })
			.mockResolvedValueOnce({ rows: [{ ...mOld, valor: 80 }] })
			.mockResolvedValueOnce({ rows: [{ email: "admin@test.com" }] });

		const res = await request(app).put("/api/lancamentos/10").send({
			descricao: "Gas",
			data_lancamento: "2026-04-15",
			valor: 80,
			tipo_lancamento: "despesa",
		});

		expect(res.statusCode).toBe(200);
		await new Promise((r) => setTimeout(r, 100));
		expect(emailSvc.sendEmail).toHaveBeenCalled();
	});
});
