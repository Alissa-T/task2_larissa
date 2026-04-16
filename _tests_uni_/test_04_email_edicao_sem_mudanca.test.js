const { templateEdicao } = require('../src/utils/emailTemplate');

describe('Email Unit Test 04', () => {
  const mockLancamento = {
    id: 1,
    descricao: 'Test Item',
    data_lancamento: '2026-04-15',
    valor: 1500.50,
    tipo_lancamento: 'receita'
  };

  test('4. templateEdicao avisa quando não houver mudanças de fato', () => {
    const output = templateEdicao(mockLancamento, mockLancamento);
    expect(output).toContain('Nenhuma alteração de valor de campo detectada');
  });
});
