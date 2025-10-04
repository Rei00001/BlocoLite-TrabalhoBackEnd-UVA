const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors(corsOptions));

app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso.');
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

        db.run(sql, [username, email, passwordHash], function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Usuário ou email já cadastrado.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                message: 'Usuário criado com sucesso!',
                userId: this.lastID
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar a requisição.' });
    }
});

app.post('/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ error: 'O campo de login e a senha são obrigatórios.' });
    }

    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';

    db.get(sql, [login, login], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.status(200).json({
                    message: 'Login realizado com sucesso!',
                    userId: user.id,
                    username: user.username
                });
            } else {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erro ao processar a requisição.' });
        }
    });
});

app.get('/notes/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC";

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ notes: rows });
    });
});

app.post('/notes', (req, res) => {
    const { title, content, userId } = req.body;

    if (!content || !userId) {
        return res.status(400).json({ error: 'Conteúdo e ID do usuário são obrigatórios.' });
    }

    const sql = 'INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)';
    db.run(sql, [title, content, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            message: 'Nota criada com sucesso!',
            noteId: this.lastID 
        });
    });
});

app.delete('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const sql = 'DELETE FROM notes WHERE id = ?';

    db.run(sql, [noteId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Nota não encontrada.' });
        }
        res.status(200).json({ message: 'Nota deletada com sucesso!' });
    });
});

app.put('/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;
    
    const sql = `UPDATE notes SET title = ?, content = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(sql, [title, content, noteId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Nota não encontrada.' });
        }
        res.status(200).json({ message: 'Nota atualizada com sucesso!' });
    });
});

app.get('/', (req, res) => {
    res.send('API do Bloco de Notas funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});




