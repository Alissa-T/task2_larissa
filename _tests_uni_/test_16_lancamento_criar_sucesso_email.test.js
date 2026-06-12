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

describe('Lancamento Unit Test 16', () => {
  test('16. Sucesso ao Criar lançamento enviando email em background', async () => {
    const request = require('supertest');
    const novoLanc = {
      descricao: 'Freelance',
      data_lancamento: '2026-04-15',
      valor: 1500,
      tipo_lancamento: 'receita'
    };
    pool.query
      .mockResolvedValueOnce({ rows: [{ ...novoLanc, id: 5 }] })
      .mockResolvedValueOnce({ rows: [{ email: 'admin@test.com' }] });

    const res = await request(app).post('/api/lancamentos').send(novoLanc);
    expect(res.statusCode).toBe(201);
    await new Promise(r => setTimeout(r, 100));
    expect(emailSvc.sendEmail).toHaveBeenCalled();
  });
});
