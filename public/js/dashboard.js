// Dashboard Page Logic — only Lançamentos
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sessão
  try {
    const sessao = await API.verificarSessao();
    if (!sessao.logado) {
      window.location.href = '/';
      return;
    }
    document.getElementById('user-name').textContent = sessao.usuario.nome;
  } catch (e) {
    window.location.href = '/';
    return;
  }

  // State
  let lancamentos = [];
  let confirmCallback = null;

  const btnNovoLancamento = document.getElementById('btn-novo-lancamento');
  const filterTipo = document.getElementById('filter-tipo');

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await API.logout();
    } catch (e) {}
    window.location.href = '/';
  });

  // ===== LOAD DATA =====
  async function loadData() {
    try {
      const [resumo, data] = await Promise.all([
        API.resumoFinanceiro(),
        API.listarLancamentos(),
      ]);

      lancamentos = data;

      document.getElementById('total-receitas').textContent = formatCurrency(resumo.total_receitas);
      document.getElementById('total-despesas').textContent = formatCurrency(resumo.total_despesas);
      document.getElementById('total-saldo').textContent = formatCurrency(resumo.saldo);

      renderLancamentos();
    } catch (error) {
      showToast('Erro ao carregar dados', 'error');
    }
  }

  // ===== LANÇAMENTOS =====
  filterTipo.addEventListener('change', () => renderLancamentos());

  function renderLancamentos() {
    const filter = filterTipo.value;
    const filtered = filter
      ? lancamentos.filter((l) => l.tipo_lancamento === filter)
      : lancamentos;

    const tbody = document.getElementById('lancamentos-table-body');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhum lançamento encontrado</td></tr>`;
      return;
    }

    filtered.forEach((l) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${l.id}</td>
        <td>${escapeHtml(l.descricao)}</td>
        <td>${formatDate(l.data_lancamento)}</td>
        <td style="font-weight:600; color: ${l.tipo_lancamento === 'receita' ? 'var(--color-receita)' : 'var(--color-despesa)'}">
          ${l.tipo_lancamento === 'despesa' ? '-' : '+'}${formatCurrency(l.valor)}
        </td>
        <td><span class="badge badge-${l.tipo_lancamento}">${l.tipo_lancamento}</span></td>
        <td>
          <div class="actions-cell">
            <button class="btn-edit" onclick="editLancamento(${l.id})" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
              </svg>
            </button>
            <button class="btn-delete" onclick="deleteLancamento(${l.id}, '${escapeHtml(l.descricao)}')" title="Excluir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Novo Lançamento
  btnNovoLancamento.addEventListener('click', () => openLancamentoModal());

  function openLancamentoModal(lancamento = null) {
    const modal = document.getElementById('modal-lancamento');
    const title = document.getElementById('modal-lancamento-title');
    const form = document.getElementById('form-lancamento');

    form.reset();
    document.getElementById('lancamento-id').value = '';

    if (lancamento) {
      title.textContent = 'Editar Lançamento';
      document.getElementById('lancamento-id').value = lancamento.id;
      document.getElementById('lancamento-descricao').value = lancamento.descricao;
      document.getElementById('lancamento-data').value = lancamento.data_lancamento.split('T')[0];
      document.getElementById('lancamento-valor').value = lancamento.valor;
      document.getElementById('lancamento-tipo').value = lancamento.tipo_lancamento;
    } else {
      title.textContent = 'Novo Lançamento';
      document.getElementById('lancamento-data').value = new Date().toISOString().split('T')[0];
    }

    modal.style.display = 'flex';
  }

  // Global edit function
  window.editLancamento = function (id) {
    const l = lancamentos.find((item) => item.id === id);
    if (l) openLancamentoModal(l);
  };

  // Global delete function
  window.deleteLancamento = function (id, descricao) {
    openConfirmModal(`Deseja excluir o lançamento "${descricao}"?`, async () => {
      try {
        await API.excluirLancamento(id);
        showToast('Lançamento excluído com sucesso!', 'success');
        loadData();
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  };

  // Save Lançamento
  document.getElementById('form-lancamento').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('lancamento-id').value;
    const dados = {
      descricao: document.getElementById('lancamento-descricao').value,
      data_lancamento: document.getElementById('lancamento-data').value,
      valor: parseFloat(document.getElementById('lancamento-valor').value),
      tipo_lancamento: document.getElementById('lancamento-tipo').value,
    };

    try {
      if (id) {
        await API.atualizarLancamento(id, dados);
        showToast('Lançamento atualizado!', 'success');
      } else {
        await API.criarLancamento(dados);
        showToast('Lançamento criado!', 'success');
      }

      closeModal('modal-lancamento');
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  // Modal close handlers
  document.getElementById('modal-lancamento-close').addEventListener('click', () => closeModal('modal-lancamento'));
  document.getElementById('modal-lancamento-cancel').addEventListener('click', () => closeModal('modal-lancamento'));

  // ===== CONFIRM MODAL =====
  function openConfirmModal(message, callback) {
    confirmCallback = callback;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('modal-confirm').style.display = 'flex';
  }

  document.getElementById('confirm-ok').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeModal('modal-confirm');
  });

  document.getElementById('confirm-cancel').addEventListener('click', () => closeModal('modal-confirm'));
  document.getElementById('modal-confirm-close').addEventListener('click', () => closeModal('modal-confirm'));

  // ===== UTILITIES =====
  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
  }

  function formatCurrency(value) {
    return parseFloat(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    };

    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });

  // Initial load
  loadData();
});
