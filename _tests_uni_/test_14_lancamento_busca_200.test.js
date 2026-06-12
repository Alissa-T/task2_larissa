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

describe('Lancamento Unit Test 14', () => {
  test('14. Busca de lançamento por ID com sucesso', async () => {
    const request = require('supertest');
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 10, descricao: 'Gas', valor: 60, tipo_lancamento: 'despesa', situacao: 'ativo' }]
    });
    const res = await request(app).get('/api/lancamentos/10');
    expect(res.statusCode).toBe(200);
    expect(res.body.valor).toBe(60);
  });
});
