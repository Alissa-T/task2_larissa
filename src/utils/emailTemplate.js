function formatMoney(val) {
  return 'R$ ' + parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

const baseTemplate = (content) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #7c3aed; color: #fff; padding: 20px;">
    <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">LANÇAMENTOS</div>
    <div style="font-size: 22px; font-weight: 800;">Notificação do sistema</div>
  </div>
  <div style="padding: 25px; background-color: #f8fafc;">
    ${content}
  </div>
</div>
`;

const gerarTabelaEstado = (lancamento) => `
  <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
    <tbody>
      <tr><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 30%; color: #374151; font-size: 14px;">ID</td><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 14px;">${lancamento.id}</td></tr>
      <tr><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; font-size: 14px;">Descrição</td><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 14px;">${lancamento.descricao}</td></tr>
      <tr><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; font-size: 14px;">Data</td><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 14px;">${formatDate(lancamento.data_lancamento)}</td></tr>
      <tr><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; font-size: 14px;">Valor</td><td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 14px;">${formatMoney(lancamento.valor)}</td></tr>
      <tr><td style="padding: 14px; font-weight: bold; color: #374151; font-size: 14px;">Tipo</td><td style="padding: 14px; color: #4b5563; text-transform: uppercase; font-size: 14px;">${lancamento.tipo_lancamento}</td></tr>
    </tbody>
  </table>
`;

const templateCriacao = (lancamento) => {
  const content = `
    <h2 style="color: #059669; margin-top: 0; font-size: 20px; font-weight: 800;">Lançamento registrado</h2>
    <p style="color: #4b5563; font-size: 15px; margin-bottom: 30px;">Um novo lançamento foi <strong>registrado</strong> no sistema. Abaixo estão os detalhes detectados.</p>
    
    <h3 style="color: #374151; font-size: 15px; font-weight: 800; margin-top: 25px; margin-bottom: 15px;">Estado atual</h3>
    ${gerarTabelaEstado(lancamento)}
  `;
  return baseTemplate(content);
};

const templateEdicao = (antes, depois) => {
  let mudancasHtml = '';

  const campos = [
    { key: 'descricao', label: 'Descrição', format: v => v },
    { key: 'data_lancamento', label: 'Data', format: formatDate },
    { key: 'valor', label: 'Valor', format: formatMoney },
    { key: 'tipo_lancamento', label: 'Tipo', format: v => String(v).toUpperCase() }
  ];

  let mudancasCount = 0;
  campos.forEach(c => {
    const valAntes = c.format(antes[c.key]);
    const valDepois = c.format(depois[c.key]);
    if (valAntes !== valDepois) {
      mudancasHtml += `
        <tr>
          <td style="padding: 14px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; font-size: 14px;">${c.label}</td>
          <td style="padding: 14px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">${valAntes}</td>
          <td style="padding: 14px; border-bottom: 1px solid #e5e7eb; font-weight: 800; color: #111827; font-size: 14px;">${valDepois}</td>
        </tr>
      `;
      mudancasCount++;
    }
  });

  const tabelaMudancas = mudancasCount > 0 ? `
    <table style="width: 100%; border-collapse: collapse; background-color: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; margin-bottom: 30px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; font-weight: 800;">Campo</th>
          <th style="padding: 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; font-weight: 800;">Antes</th>
          <th style="padding: 14px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; font-weight: 800;">Depois</th>
        </tr>
      </thead>
      <tbody>
        ${mudancasHtml}
      </tbody>
    </table>
  ` : '<p style="color: #6b7280; font-style: italic; margin-bottom: 30px;">Nenhuma alteração de valor de campo detectada (salvamento sem modificações).</p>';

  const content = `
    <h2 style="color: #d3ea3fff; margin-top: 0; font-size: 20px; font-weight: 800;">Lançamento atualizado</h2>
    <p style="color: #4b5563; font-size: 15px; margin-bottom: 25px;">Um lançamento foi <strong>atualizado</strong>. Abaixo estão as mudanças detectadas.</p>
    
    ${tabelaMudancas}
    
    <h3 style="color: #374151; font-size: 15px; font-weight: 800; margin-bottom: 15px;">Estado atual</h3>
    ${gerarTabelaEstado(depois)}
  `;
  return baseTemplate(content);
};

const templateExclusao = (lancamento) => {
  const content = `
    <h2 style="color: #dc2626; margin-top: 0; font-size: 20px; font-weight: 800;">Lançamento excluído</h2>
    <p style="color: #4b5563; font-size: 15px; margin-bottom: 30px;">O lançamento abaixo foi <strong>removido</strong> do sistema e não afetará mais os saldos da dashboard.</p>
    
    <h3 style="color: #374151; font-size: 15px; font-weight: 800; margin-top: 25px; margin-bottom: 15px;">Último estado conhecido</h3>
    <div style="opacity: 0.85;">
      ${gerarTabelaEstado(lancamento)}
    </div>
  `;
  return baseTemplate(content);
};

module.exports = {
  templateCriacao,
  templateEdicao,
  templateExclusao
};
