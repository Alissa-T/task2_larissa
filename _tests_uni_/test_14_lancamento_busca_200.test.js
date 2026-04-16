jest.mock('../src/config/database', () => ({
  query: jest.fn()
}));
jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.session = { 
    id: 'test-session-id',
    usuario: { id: 1, nome: 'Admin', email: 'admin@test.com' },
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 },
    touch: jest.fn(),
    save: jest.fn((cb) => cb && cb())
  };
  next();
});
const pool = require('../src/config/database');
const request = require('supertest');
const app = require('../server');

describe('Lancamento Unit Test 14', () => {
  test('14. Busca de lançamento por ID com sucesso', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 10, descricao: 'Gas', valor: 60, tipo_lancamento: 'despesa', situacao: 'ativo' }] });
    const res = await request(app).get('/api/lancamentos/10');
    expect(res.statusCode).toBe(200);
    expect(res.body.valor).toBe(60);
  });
});
