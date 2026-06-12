let app;
let pool;

beforeAll(() => {
  jest.isolateModules(() => {
    jest.mock('../src/config/database', () => ({ query: jest.fn() }));
    jest.mock('../src/middleware/auth', () => (req, res, next) => {
      req.session = { usuario: { id: 1, nome: 'Admin', email: 'admin@test.com' } };
      next();
    });
    pool = require('../src/config/database');
    app  = require('../server');
  });
});

describe('Lancamento Unit Test 20', () => {
  test('20. Rota de resumo totaliza ganhos e perdas perfeitamente', async () => {
    const request = require('supertest');
    const mockResumo = { total_receitas: 5000, total_despesas: 1500, saldo: 3500 };
    pool.query.mockResolvedValueOnce({ rows: [mockResumo] });

    const res = await request(app).get('/api/lancamentos/resumo');
    expect(res.statusCode).toBe(200);
    expect(res.body.saldo).toBe(3500);
  });
});
