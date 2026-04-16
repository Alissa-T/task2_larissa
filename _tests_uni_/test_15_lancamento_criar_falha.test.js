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
const request = require('supertest');
const app = require('../server');

describe('Lancamento Unit Test 15', () => {
  test('15. Falha ao tentar Criar um lançamento sem dados obrigatórios', async () => {
    const res = await request(app).post('/api/lancamentos').send({ descricao: 'Luz' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('obrigatórios');
  });
});
