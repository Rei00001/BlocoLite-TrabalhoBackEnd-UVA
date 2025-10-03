const registerForm = document.getElementById('register-form');

function showMessage(text) {
  alert(text);
}

if (!registerForm) {
  console.error('registerForm não encontrado. Verifique o id do form e se o script foi carregado com defer.');
} else {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 1) Lê os valores dos inputs
    const username = document.getElementById('usuario').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('senha').value;
    const confirmPassword = document.getElementById('confirmar-senha').value;

    // 2) Suas validações (estão ótimas, vamos mantê-las!)
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
    // (Pode adicionar mais validações aqui se quiser)

    // 3) Monta o objeto para enviar à API
    const userData = {
      username: username,
      email: email,
      password: password
    };
    
    // 4) Tenta registrar o usuário via API
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) { // Status 201 Created
        // SUCESSO!
        showMessage('Registro realizado com sucesso! Agora você pode fazer o login.');
        // Redireciona para a página de login
        window.location.href = 'login.html';
      } else {
        // ERRO! A API retornou uma falha (ex: usuário já existe)
        // A mensagem de erro vem do nosso server.js (ex: data.error)
        showMessage(data.error || 'Ocorreu um erro durante o registro.');
      }

    } catch (error) {
      // Erro de rede (servidor fora do ar, etc.)
      console.error('Erro de conexão:', error);
      showMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  });
}
