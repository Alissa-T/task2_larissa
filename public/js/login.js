// Login Page Logic
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar se já está logado
  try {
    const sessao = await API.verificarSessao();
    if (sessao.logado) {
      window.location.href = '/dashboard';
      return;
    }
  } catch (e) {
    // Não logado, continuar na página de login
  }

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('login-error');
  const btnText = document.querySelector('.btn-text');
  const btnLoader = document.querySelector('.btn-loader');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('login-input').value.trim();
    const senha = document.getElementById('senha-input').value;

    if (!login || !senha) {
      showError('Preencha todos os campos');
      return;
    }

    // Loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    errorEl.style.display = 'none';

    try {
      await API.login(login, senha);
      window.location.href = '/dashboard';
    } catch (error) {
      showError(error.message || 'Login ou senha inválidos');
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
});
