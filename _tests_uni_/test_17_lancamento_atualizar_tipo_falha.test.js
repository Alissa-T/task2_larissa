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

describe('Lancamento Unit Test 17', () => {
  test('17. Falha na atualização caso tipo for indevido', async () => {
    const request = require('supertest');
    const updLanc = {
      descricao: 'Luz',
      data_lancamento: '2026-04-10',
      valor: 50,
      tipo_lancamento: 'investimento'
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 10, descricao: 'Luz', valor: 50, tipo_lancamento: 'despesa', situacao: 'ativo' }] })
      .mockRejectedValueOnce(new Error('DB Constraint Violation Mock'));

    const res = await request(app).put('/api/lancamentos/10').send(updLanc);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
