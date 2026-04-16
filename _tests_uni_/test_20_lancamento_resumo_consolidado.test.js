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

describe('Lancamento Unit Test 20', () => {
  test('20. Rota de resumo totaliza ganhos e perdas perfeitamente', async () => {
    const mockResumo = { total_receitas: 5000, total_despesas: 1500, saldo: 3500 };
    pool.query.mockResolvedValueOnce({ rows: [mockResumo] });
    
    const res = await request(app).get('/api/lancamentos/resumo');
    expect(res.statusCode).toBe(200);
    expect(res.body.saldo).toBe(3500); 
  });
});
