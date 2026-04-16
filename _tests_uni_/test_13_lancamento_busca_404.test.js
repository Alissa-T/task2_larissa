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

describe('Lancamento Unit Test 13', () => {
  test('13. Busca de lançamento por ID deve retornar 404 se não existir', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/lancamentos/99');
    expect(res.statusCode).toBe(404);
  });
});
