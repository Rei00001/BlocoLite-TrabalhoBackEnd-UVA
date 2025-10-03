const loginForm = document.getElementById('login-form');

// Função para exibir mensagens de erro ao usuário.
// Pode ser um alert, ou você pode criar um elemento no HTML para isso.
function showMessage(text) {
  alert(text);
}

if (!loginForm) {
  console.error('Formulário com id="login-form" não encontrado.');
} else {
  loginForm.addEventListener('submit', async function(event) {
    // 1. Prevenir o recarregamento padrão da página
    event.preventDefault();

    // 2. Pegar os valores dos inputs
    // Usamos 'login-input' como um nome genérico, já que pode ser email ou username
    const userInput = document.getElementById('usuario').value.trim();
    const passwordInput = document.getElementById('senha').value;

    // 3. Montar o objeto de dados para enviar à API
    const loginData = {
      login: userInput,
      password: passwordInput
    };

    // 4. Fazer a requisição para a API usando fetch
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST', // Estamos enviando dados
        headers: {
          'Content-Type': 'application/json', // Avisando que estamos enviando JSON
        },
        body: JSON.stringify(loginData), // Convertendo nosso objeto JS para uma string JSON
      });

      const data = await response.json(); // Lendo a resposta da API como JSON

      // 5. Verificar a resposta da API
      if (response.ok) { // response.ok é true para status 200-299
        // SUCESSO!
        console.log('Login bem-sucedido:', data);

        // Salva as informações do usuário no localStorage para usar em outras páginas
        // NUNCA salve a senha! Apenas dados úteis como ID e nome de usuário.
        localStorage.setItem('currentUser', JSON.stringify({
            userId: data.userId,
            username: data.username
        }));

        // Redireciona para a página de notas
        window.location.href = '/notas.html';

      } else {
        // FALHA! A API retornou um erro (ex: 401 Credenciais inválidas)
        // 'data.error' virá da nossa API, ex: { error: 'Credenciais inválidas.' }
        showMessage(data.error || 'Ocorreu um erro ao tentar fazer login.');
      }

    } catch (error) {
      // Erro de rede (API fora do ar, sem internet, etc.)
      console.error('Erro de conexão:', error);
      showMessage('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  });
}

