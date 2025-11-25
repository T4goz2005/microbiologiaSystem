const db = require('../db'); 

// 1. Listar Pacientes (com contagem de exames)
const listarPacientesComAvaliacoes = async (req, res) => {
    // Faz o JOIN com a tabela 'exames' para sabermos quantos exames cada paciente tem
    const querySQL = `
        SELECT 
            p.*, 
            json_agg(
                json_build_object(
                    'id', e.id, 
                    'data_exame', e.data_exame
                )
            ) AS avaliacoes
        FROM pacientes p
        LEFT JOIN exames e ON p.id = e.paciente_id
        GROUP BY p.id
        ORDER BY p.nome;
    `;

    try {
        const result = await db.query(querySQL);
        
        // Tratamento para o caso de LEFT JOIN retornar [null] quando não tem exames
        const pacientesFormatados = result.rows.map(p => ({
            ...p,
            avaliacoes: (p.avaliacoes.length === 1 && p.avaliacoes[0].id === null) 
                        ? [] 
                        : p.avaliacoes
        }));

        res.status(200).json(pacientesFormatados);
    } catch (error) {
        console.error("Erro ao listar pacientes:", error.stack);
        res.status(500).json({ error: "Erro ao buscar lista de pacientes." });
    }
};

// 2. Cadastrar Paciente (Novos Campos)
const cadastrarPaciente = async (req, res) => {
    const { nome, idade, telefone, data_nascimento, nome_mae, data_coleta, sangue } = req.body;
    
    // Validação: Apenas Nome e Nascimento obrigatórios (o resto é opcional)
    if (!nome || !data_nascimento) {
        return res.status(400).json({ error: 'Nome e Data de Nascimento são obrigatórios.' });
    }

    const insertSQL = `
        INSERT INTO pacientes (nome, idade, telefone, data_nascimento, nome_mae, data_coleta, sangue)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [nome, idade, telefone, data_nascimento, nome_mae, data_coleta, sangue];

    try {
        const result = await db.query(insertSQL, values);
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error("Erro ao cadastrar:", error.stack);
        res.status(500).json({ error: "Erro ao cadastrar paciente." });
    }
};

// 3. Excluir Paciente
const excluirPaciente = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM pacientes WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Paciente não encontrado." });
        }

        res.status(200).json({ message: "Paciente excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir:", error);
        res.status(500).json({ error: "Erro ao excluir paciente." });
    }
};

const atualizarPaciente = async (req, res) => {
    const { id } = req.params;
    // Recebe os campos atualizados
    const { nome, idade, telefone, data_nascimento, nome_mae, data_coleta, sangue } = req.body;

    const updateSQL = `
        UPDATE pacientes 
        SET nome = $1, idade = $2, telefone = $3, data_nascimento = $4, nome_mae = $5, data_coleta = $6, sangue = $7
        WHERE id = $8
        RETURNING *;
    `;
    const values = [nome, idade, telefone, data_nascimento, nome_mae, data_coleta, sangue, id];

    try {
        const result = await db.query(updateSQL, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Paciente não encontrado." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ error: "Erro ao atualizar paciente." });
    }
};

module.exports = {
    listarPacientesComAvaliacoes,
    cadastrarPaciente,
    excluirPaciente,
    atualizarPaciente // ⚠️ NÃO ESQUEÇA DE ADICIONAR NA EXPORTAÇÃO
};