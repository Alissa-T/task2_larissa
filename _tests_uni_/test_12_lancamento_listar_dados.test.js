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

describe('Lancamento Unit Test 12', () => {
  test('12. Listar lançamentos retorna dados quando existirem', async () => {
    const request = require('supertest');
    const mockData = [
      { id: 1, descricao: 'Salário', valor: 5000, tipo_lancamento: 'receita', situacao: 'ativo' },
      { id: 2, descricao: 'Aluguel', valor: 1200, tipo_lancamento: 'despesa', situacao: 'ativo' }
    ];
    pool.query.mockResolvedValueOnce({ rows: mockData });
    const res = await request(app).get('/api/lancamentos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].descricao).toBe('Salário');
  });
});
