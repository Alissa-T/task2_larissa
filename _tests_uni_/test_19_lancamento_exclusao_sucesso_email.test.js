let app;
let pool;
let emailSvc;

beforeAll(() => {
  jest.isolateModules(() => {
    jest.mock('../src/config/database', () => ({ query: jest.fn() }));
    jest.mock('../src/middleware/auth', () => (req, res, next) => {
      req.session = { usuario: { id: 1, nome: 'Admin', email: 'admin@test.com' } };
      next();
    });
    jest.mock('../src/utils/emailService', () => ({
      sendEmail: jest.fn().mockResolvedValue(true)
    }));
    pool     = require('../src/config/database');
    emailSvc = require('../src/utils/emailService');
    app      = require('../server');
  });
});

describe('Lancamento Unit Test 19', () => {
  test('19. Sucesso na Exclusão lógica e notificação via e-mail', async () => {
    const request = require('supertest');
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
