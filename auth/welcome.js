const BASE_URL ='https://blocolite-trabalhobackend-uva.onrender.com';

const loginForm = document.getElementById('login-form');

function showMessage(text) {
  alert(text);
}

if (!loginForm) {
  console.error('Formulário com id="login-form" não encontrado.');
} else {
  loginForm.addEventListener('submit', async function(event) {

    event.preventDefault();

    const userInput = document.getElementById('usuario').value.trim();
    const passwordInput = document.getElementById('senha').value;

    const loginData = {
      login: userInput,
      password: passwordInput
    };

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(loginData), 
      });

      const data = await response.json();
      if (response.ok) { 
        console.log('Login bem-sucedido:', data);

        localStorage.setItem('currentUser', JSON.stringify({
            userId: data.userId,
            username: data.username
        }));

        window.location.href = '../notas.html';

      } else {
        showMessage(data.error || 'Ocorreu um erro ao tentar fazer login.');
      }

    } catch (error) {
      console.error('Erro de conexão:', error);
      showMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  });
}

