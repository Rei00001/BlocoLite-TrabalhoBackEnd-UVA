 // Executa o script quando o conteúdo da página estiver totalmente carregado
window.addEventListener('DOMContentLoaded', () => {
    // --- 1. VERIFICAÇÃO DE LOGIN E REFERÊNCIAS DO DOM ---

    // Pega o usuário do localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Se não houver usuário logado, redireciona para a página de login
    if (!currentUser) {
        window.location.href = 'login.html';
        return; // Para a execução do script
    }
    
  const textarea = document.getElementById("text-block");

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";               // reseta altura
    textarea.style.height = textarea.scrollHeight + "px"; // ajusta para o conteúdo
  });

    // Pega as referências dos elementos HTML que vamos usar
    const titleInput = document.getElementById('title-block');
    const contentInput = document.getElementById('text-block');
    const saveButton = document.querySelector('.button-saved .primary.button');
    const notesContainer = document.getElementById('notes-container');
    const logoutButton = document.querySelector('header .secondary.button');

    // Variável para controlar se estamos editando uma nota existente
    let currentEditingNoteId = null;

    // --- 2. FUNÇÕES PRINCIPAIS ---

    /**
     * Busca as notas do usuário na API e as exibe na tela.
     */
    async function fetchAndDisplayNotes() {
        try {
            const response = await fetch(`http://localhost:3000/notes/${currentUser.userId}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar notas.');
            }
            const data = await response.json();
            
            notesContainer.innerHTML = ''; // Limpa o contêiner antes de adicionar as novas notas
            
            data.notes.forEach(note => {
                const noteElement = createNoteElement(note);
                notesContainer.appendChild(noteElement);
            });

        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível carregar suas notas.');
        }
    }

    /**
     * Cria o elemento HTML (a "miniatura") para uma nota.
     * @param {object} note - O objeto da nota vindo da API.
     * @returns {HTMLElement} O elemento div da nota.
     */
    function createNoteElement(note) {
        const div = document.createElement('div');
        div.className = 'note-card'; // Adicione estilos para .note-card no seu CSS

        // Trunca o conteúdo para a prévia
        const shortContent = note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content;

        // Formata a data
        const formattedDate = new Date(note.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        div.innerHTML = `
            <h3>${note.title || 'Sem Título'}</h3>
            <p>${shortContent}</p>
            <div class="note-footer">
                <small>Última atualização: ${formattedDate}</small>
                <div class="note-actions">
                    <button class="edit-btn primary button">Editar <span class="button-icon"><img src="/img/edit.png" alt="edit"></span></button>
                    <button class="delete-btn secondary button">Excluir <span class="button-icon"><img src="/img/lixeira.png" alt="delete"></span></button>
                </div>
            </div>
        `;

        // Adiciona os eventos aos botões de editar e excluir
        div.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note.id));
        div.querySelector('.edit-btn').addEventListener('click', () => handleEdit(note));

        return div;
    }

    /**
     * Lida com o clique no botão de salvar (cria ou atualiza uma nota).
     */
    async function handleSave() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!content) {
            alert('O conteúdo da nota não pode estar vazio.');
            return;
        }

        const noteData = { title, content, userId: currentUser.userId };

        try {
            let response;
            if (currentEditingNoteId) {
                // Se estamos editando, usamos o método PUT
                response = await fetch(`http://localhost:3000/notes/${currentEditingNoteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(noteData),
                });
            } else {
                // Se não, estamos criando, usamos o método POST
                response = await fetch('http://localhost:3000/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(noteData),
                });
            }

            if (!response.ok) {
                throw new Error('Falha ao salvar a nota.');
            }

            // Limpa os campos e reseta o modo de edição
            titleInput.value = '';
            contentInput.value = '';
            saveButton.textContent = 'Salvar';
            currentEditingNoteId = null;

            // Atualiza a lista de notas na tela
            fetchAndDisplayNotes();

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Não foi possível salvar a nota.'); 
        }
    }

    /**
     * Deleta uma nota.
     * @param {number} noteId - O ID da nota a ser deletada.
     */
    async function deleteNote(noteId) {
        // Confirmação antes de deletar
        if (!confirm('Tem certeza que deseja excluir esta nota?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir a nota.');
            }
            
            // Atualiza a lista de notas na tela
            fetchAndDisplayNotes();

        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Não foi possível excluir a nota.');
        }
    }

    /**
     * Prepara o formulário para edição de uma nota.
     * @param {object} note - O objeto da nota a ser editada.
     */
    function handleEdit(note) {
        // Preenche os campos de texto com os dados da nota
        titleInput.value = note.title;
        contentInput.value = note.content;
        
        // Guarda o ID da nota que está sendo editada
        currentEditingNoteId = note.id;
        
        // Muda o texto do botão para indicar que estamos atualizando
        saveButton.innerHTML = 'Atualizar Nota <span class="button-icon"><img src="/img/ok.png" alt="ok"></span>';

        // Rola a tela para o topo para facilitar a edição
        window.scrollTo(0, 0);
    }

    /**
     * Faz o logout do usuário.
     */
    function handleLogout() {
        localStorage.removeItem('currentUser'); // Remove o usuário do localStorage
        window.location.href = 'login.html'; // Redireciona para o login
    }

    // --- 3. ADICIONANDO OS EVENT LISTENERS ---

    saveButton.addEventListener('click', handleSave);
    logoutButton.addEventListener('click', handleLogout);

    // --- 4. INICIALIZAÇÃO ---

    // Busca e exibe as notas do usuário assim que a página carrega
    fetchAndDisplayNotes();
});
