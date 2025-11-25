const db = require('../db');

// Listar todos os modelos
const listarModelos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM modelos ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao listar modelos:", error);
        res.status(500).json({ error: "Erro ao buscar modelos." });
    }
};

// Criar novo modelo (ATUALIZADO PARA SALVAR OS CAMPOS)
const criarModelo = async (req, res) => {
    // 1. Agora pegamos também o array 'campos'
    const { nome, descricao, campos } = req.body;

    if (!nome) {
        return res.status(400).json({ error: "O nome do modelo é obrigatório." });
    }

    // 2. Prepara os campos para salvar como JSON
    // Se não vier nada, salva um array vazio '[]' para não dar erro no banco
    const camposJson = JSON.stringify(campos || []);

    try {
        // 3. Query SQL atualizada para incluir a coluna 'campos'
        const result = await db.query(
            'INSERT INTO modelos (nome, descricao, campos) VALUES ($1, $2, $3) RETURNING *',
            [nome, descricao, camposJson]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar modelo:", error);
        res.status(500).json({ error: "Erro ao salvar modelo." });
    }
};

const atualizarModelo = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, campos } = req.body;

    if (!nome) return res.status(400).json({ error: "Nome é obrigatório." });

    const camposJson = JSON.stringify(campos || []);

    try {
        const result = await db.query(
            'UPDATE modelos SET nome = $1, descricao = $2, campos = $3 WHERE id = $4 RETURNING *',
            [nome, descricao, camposJson, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Modelo não encontrado." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ error: "Erro ao atualizar modelo." });
    }
};

// Excluir Modelo (DELETE)
const excluirModelo = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM modelos WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Modelo não encontrado." });
        }

        res.status(200).json({ message: "Modelo excluído.", id });
    } catch (error) {
        console.error("Erro ao excluir:", error);
        res.status(500).json({ error: "Erro ao excluir modelo. Ele pode estar em uso." });
    }
};

module.exports = { listarModelos, criarModelo, atualizarModelo, excluirModelo };