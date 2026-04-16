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
jest.mock('../src/utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));
const pool = require('../src/config/database');
const request = require('supertest');
const app = require('../server');
const emailSvc = require('../src/utils/emailService');

describe('Lancamento Unit Test 16', () => {
  test('16. Sucesso ao Criar lançamento enviando email em background', async () => {
    const novoLanc = { descricao: 'Freelance', data_lancamento: '2026-04-15', valor: 1500, tipo_lancamento: 'receita' };
    pool.query
      .mockResolvedValueOnce({ rows: [{ ...novoLanc, id: 5 }] })
      .mockResolvedValueOnce({ rows: [{ email: 'admin@test.com' }] });
      
    const res = await request(app).post('/api/lancamentos').send(novoLanc);
    expect(res.statusCode).toBe(201);
    await new Promise(r => setTimeout(r, 100)); 
    expect(emailSvc.sendEmail).toHaveBeenCalled();
  });
});
