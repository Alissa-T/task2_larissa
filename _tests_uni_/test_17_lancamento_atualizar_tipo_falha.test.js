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

describe('Lancamento Unit Test 17', () => {
  test('17. Falha na atualização caso tipo for indevido', async () => {
    const updLanc = { descricao: 'Luz', data_lancamento: '2026-04-10', valor: 50, tipo_lancamento: 'investimento' };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error('DB Constraint Violation Mock'));

    const res = await request(app).put('/api/lancamentos/10').send(updLanc);
    expect(res.statusCode).toBeGreaterThanOrEqual(400); 
  });
});
