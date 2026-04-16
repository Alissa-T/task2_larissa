jest.mock('../src/config/database', () => ({
  query: jest.fn()
}));
const pool = require('../src/config/database');
const request = require('supertest');
const app = require('../server');

describe('User Unit Test 06', () => {
  test('6. Deve falhar cadastro de usuário se o login já existir', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ login: 'admin' }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Teste', email: 't@t.com', login: 'admin', senha: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Login já está em uso');
  });
});
