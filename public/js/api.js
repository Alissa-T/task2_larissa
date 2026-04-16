// API helper module
const API = {
  baseUrl: '',

  async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${this.baseUrl}${url}`, mergedOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Auth
  async login(login, senha) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, senha }),
    });
  },

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  },

  async registrarUsuario(dados) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async verificarSessao() {
    return this.request('/api/auth/sessao');
  },

  // Lançamentos
  async listarLancamentos() {
    return this.request('/api/lancamentos');
  },

  async buscarLancamento(id) {
    return this.request(`/api/lancamentos/${id}`);
  },

  async criarLancamento(dados) {
    return this.request('/api/lancamentos', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async atualizarLancamento(id, dados) {
    return this.request(`/api/lancamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  async excluirLancamento(id) {
    return this.request(`/api/lancamentos/${id}`, {
      method: 'DELETE',
    });
  },

  async resumoFinanceiro() {
    return this.request('/api/lancamentos/resumo');
  },

  // Usuários
  async listarUsuarios() {
    return this.request('/api/usuarios');
  },

  async criarUsuario(dados) {
    return this.request('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async atualizarUsuario(id, dados) {
    return this.request(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  async excluirUsuario(id) {
    return this.request(`/api/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};
