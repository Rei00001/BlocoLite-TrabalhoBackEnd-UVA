const BASE_URL ='https://blocolite-trabalhobackend-uva.onrender.com';

window.addEventListener('DOMContentLoaded', () => {

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || !currentUser.userId) {
        window.location.href = 'login.html';
        return;
    }
    
  const textarea = document.getElementById("text-block");

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";              
    textarea.style.height = textarea.scrollHeight + "px";
  });

    const titleInput = document.getElementById('title-block');
    const contentInput = document.getElementById('text-block');
    const saveButton = document.querySelector('.button-saved .primary.button');
    const notesContainer = document.getElementById('notes-container');
    const logoutButton = document.querySelector('header .secondary.button');

    let currentEditingNoteId = null;

    async function fetchAndDisplayNotes() {
        try {
            const response = await fetch(`${BASE_URL}/notes/${currentUser.userId}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar notas.');
            }
            const data = await response.json();
            
            notesContainer.innerHTML = ''; 
            
            data.notes.forEach(note => {
                const noteElement = createNoteElement(note);
                notesContainer.appendChild(noteElement);
            });

        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível carregar suas notas.');
        }
    }

    function createNoteElement(note) {
        const div = document.createElement('div');
        div.className = 'note-card'; 

        const shortContent = note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content;

        const formattedDate = new Date(note.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        div.innerHTML = `
            <h3>${note.title || 'Sem Título'}</h3>
            <p>${shortContent}</p>
            <div class="note-footer">
                <small>Última atualização: ${formattedDate}</small>
                <div class="note-actions">
                    <button class="edit-btn primary button">Editar <span class="button-icon"><img src="img/edit.png" alt="edit"></span></button>
                    <button class="delete-btn secondary button">Excluir <span class="button-icon"><img src="img/lixeira.png" alt="delete"></span></button>
                </div>
            </div>
        `;

        div.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note.id));
        div.querySelector('.edit-btn').addEventListener('click', () => handleEdit(note));

        return div;
    }

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
                response = await fetch(`${BASE_URL}/notes/${currentEditingNoteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(noteData),
                });
            } else {
                response = await fetch(`${BASE_URL}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(noteData),
                });
            }

            if (!response.ok) {
                throw new Error('Falha ao salvar a nota.');
            }

            titleInput.value = '';
            contentInput.value = '';
            saveButton.textContent = 'Salvar';
            currentEditingNoteId = null;

            fetchAndDisplayNotes();

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Não foi possível salvar a nota.'); 
        }
    }

    async function deleteNote(noteId) {
        if (!confirm('Tem certeza que deseja excluir esta nota?')) {
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir a nota.');
            }
            
            fetchAndDisplayNotes();

        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Não foi possível excluir a nota.');
        }
    }

    function handleEdit(note) {
        titleInput.value = note.title;
        contentInput.value = note.content;
        
        currentEditingNoteId = note.id;
        
        saveButton.innerHTML = 'Atualizar Nota <span class="button-icon"><img src="img/ok.png" alt="ok"></span>';

        currentEditingNoteId = note.id;

        saveButton.innerHTML = 'Atualizar Nota <span class="button-icon"><img src="img/ok.png" alt="ok"></span>';

        window.scrollTo(0, 0);
    }

    function handleLogout(event) {
        event.preventDefault();
        localStorage.removeItem('currentUser'); 
        window.location.href = 'login.html'; 
    }

    saveButton.addEventListener('click', handleSave);
    logoutButton.addEventListener('click', handleLogout);

    fetchAndDisplayNotes();
});
