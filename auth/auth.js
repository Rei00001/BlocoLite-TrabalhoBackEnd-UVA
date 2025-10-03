const registerForm = document.getElementById('register-form');

function showMessage(text) {
  alert(text);
}

if (!registerForm) {
  console.error('registerForm não encontrado. Verifique o id do form e se o script foi carregado com defer.');
} else {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('usuario').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('senha').value;
    const confirmPassword = document.getElementById('confirmar-senha').value;

    if (username.length < 3) {
      showMessage('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('Email inválido.');
      return;
    }
    if (password !== confirmPassword) {
      showMessage('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      showMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const userData = {
      username: username,
      email: email,
      password: password
    };

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Registro realizado com sucesso! Agora você pode fazer o login.');
        window.location.href = '../login.html';
      } else {
        showMessage(data.error || 'Ocorreu um erro durante o registro.');
      }

    } catch (error) {
      console.error('Erro de conexão:', error);
      showMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  });
}
