document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const registerBtn = document.getElementById('register-btn');
  const btnText = registerBtn.querySelector('.btn-text');
  const btnLoader = registerBtn.querySelector('.btn-loader');
  const errorMsg = document.getElementById('register-error');
  const successMsg = document.getElementById('register-success');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Resetar mensagens
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    // Obter campos
    const nome = document.getElementById('nome-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const login = document.getElementById('login-input').value.trim();
    const senha = document.getElementById('senha-input').value;

    if (!nome || !email || !login || !senha) {
      showError('Por favor, preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Estado de loading
    setLoading(true);

    try {
      // Chama o endpoint da API para registrar usuário
      await API.registrarUsuario({ nome, login, senha, email });
      
      // Sucesso
      registerForm.reset();
      showSuccess('Conta criada com sucesso! Redirecionando para o login...');
      
      // Redireciona em 2s
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      // O erro já vem tratado do APIHelper
      showError(error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  });

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
  }

  function showSuccess(message) {
    successMsg.textContent = message;
    successMsg.style.display = 'block';
  }

  function setLoading(isLoading) {
    if (isLoading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-block';
      registerBtn.disabled = true;
    } else {
      btnText.style.display = 'inline-block';
      btnLoader.style.display = 'none';
      registerBtn.disabled = false;
    }
  }
});
