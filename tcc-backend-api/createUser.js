// create_user.js
const bcrypt = require('bcryptjs');
const db = require('./db'); // Importa a conexão com o PostgreSQL
require('dotenv').config();

const email_teste = 'teste@tcc.com';
const senha_original = '123456';

async function cadastrarUsuarioDeTeste() {
    try {
        // 1. Gerar o hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha_original, salt);
        
        // 2. Inserir no banco de dados (tabela 'usuarios')
        const result = await db.query(
            'INSERT INTO usuarios (email, senha_hash) VALUES ($1, $2) RETURNING id',
            [email_teste, senhaHash]
        );

        if (result.rows.length > 0) {
            console.log(`✅ Usuário de teste criado com sucesso!`);
            console.log(`   E-mail: ${email_teste}`);
            console.log(`   Senha: ${senha_original}`);
            console.log(`   ID no BD: ${result.rows[0].id}`);
        }
    } catch (error) {
        if (error.code === '23505') { // Código de erro para UNIQUE violation (usuário já existe)
            console.log(`⚠️ O usuário ${email_teste} já existe no banco de dados. Teste com este usuário.`);
        } else {
            console.error('❌ Erro ao criar usuário de teste:', error.stack);
        }
    } finally {
        // Encerra o processo de node.js
        process.exit();
    }
}

// Chame esta função UMA ÚNICA VEZ
cadastrarUsuarioDeTeste(); 