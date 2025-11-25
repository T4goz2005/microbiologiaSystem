const db = require('../db'); 

// GET: Histórico por Paciente
const listarExamesPorPaciente = async (req, res) => {
    const { pacienteId } = req.params;
    try {
        const result = await db.query(`
            SELECT * FROM exames 
            WHERE paciente_id = $1 
            ORDER BY data_exame DESC
        `, [pacienteId]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro ao listar exames:", error);
        res.status(500).json({ error: "Erro ao buscar exames." });
    }
};

// GET: Histórico Geral
const listarTodosExames = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, p.nome as nome_paciente
            FROM exames e
            JOIN pacientes p ON e.paciente_id = p.id
            ORDER BY e.data_exame DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erro geral:", error);
        res.status(500).json({ error: "Erro ao buscar histórico geral." });
    }
};

// POST: Salvar Novo Exame
const criarExame = async (req, res) => {
    const { paciente_id, respostas, status } = req.body; // Recebe status

    if (!paciente_id || !respostas) {
        return res.status(400).json({ error: "Dados incompletos." });
    }

    const tipo = respostas.tipo_exame || 'GERAL'; 
    const respostasJson = JSON.stringify(respostas);
    const statusFinal = status || 'CONCLUIDO';

    try {
        const result = await db.query(`
            INSERT INTO exames (paciente_id, tipo_exame, respostas, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [paciente_id, tipo, respostasJson, statusFinal]);

        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error("Erro ao salvar:", error);
        res.status(500).json({ error: "Erro ao salvar exame." });
    }
};

// 🆕 PUT: Atualizar Exame Existente
const atualizarExame = async (req, res) => {
    const { id } = req.params;
    const { respostas, status } = req.body;

    const respostasJson = JSON.stringify(respostas);

    try {
        const result = await db.query(`
            UPDATE exames 
            SET respostas = $1, status = $2
            WHERE id = $3
            RETURNING *
        `, [respostasJson, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Exame não encontrado." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ error: "Erro ao atualizar exame." });
    }
};

const excluirExame = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM exames WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Exame não encontrado." });
        }

        res.status(200).json({ message: "Exame excluído com sucesso.", id });
    } catch (error) {
        console.error("Erro ao excluir exame:", error);
        res.status(500).json({ error: "Erro interno ao excluir exame." });
    }
};

module.exports = { 
    listarExamesPorPaciente, 
    listarTodosExames,
    criarExame,
    atualizarExame,
    excluirExame
};