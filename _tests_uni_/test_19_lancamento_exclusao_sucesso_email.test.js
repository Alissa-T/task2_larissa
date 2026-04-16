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

describe('Lancamento Unit Test 19', () => {
  test('19. Sucesso na Exclusão lógica e notificação via e-mail', async () => {
    const mOld = { id: 10, descricao: 'Gas', valor: 60, tipo_lancamento: 'despesa', situacao: 'ativo' };
    pool.query
      .mockResolvedValueOnce({ rows: [mOld] }) 
      .mockResolvedValueOnce({ rows: [{ email: 'admin@test.com' }] });

    const res = await request(app).delete('/api/lancamentos/10');
    expect(res.statusCode).toBe(200);
    await new Promise(r => setTimeout(r, 100)); 
    expect(emailSvc.sendEmail).toHaveBeenCalled();
  });
});
