// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ⚠️ Se você precisar cadastrar um usuário de teste:
/*
const cadastrarUsuarioDeTeste = async (email, senha) => {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    const result = await db.query(
        'INSERT INTO usuarios (email, senha_hash) VALUES ($1, $2) RETURNING id',
        [email, senhaHash]
    );
    console.log('Usuário de teste cadastrado:', result.rows[0].id);
};
// Use: cadastrarUsuarioDeTeste('admin@tcc.com', 'senha123'); uma vez.
*/


const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Buscar o usuário pelo email
        const userResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = userResult.rows[0];

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas: E-mail não encontrado.' });
        }

        // 2. Comparar a senha fornecida com a senha hashizada do BD
        const isMatch = await bcrypt.compare(senha, usuario.senha_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas: Senha incorreta.' });
        }

        // 3. Gerar o Token JWT
        const payload = { 
            user: { 
                id: usuario.id,
                email: usuario.email
            } 
        };
        
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // O token expira em 1 hora
        );

        // 4. Retornar o token para o frontend
        res.json({ token });

    } catch (error) {
        console.error("Erro no login:", error.stack);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = { login };