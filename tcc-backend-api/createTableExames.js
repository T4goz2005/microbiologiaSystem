const db = require('./db');

async function criarTabelaExames() {
    console.log("🔄 Criando tabela de Exames Microbiológicos...");
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS exames (
                id SERIAL PRIMARY KEY,
                paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
                tipo_exame VARCHAR(50) NOT NULL, -- 'URINA' ou 'ESCARRO'
                respostas JSONB NOT NULL DEFAULT '{}', -- Onde guardamos todo o formulário
                data_exame TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'CONCLUIDO' -- Para controle futuro
            );
        `);
        console.log("✅ Tabela 'exames' criada com sucesso!");
        
        // Opcional: Se quiser apagar a tabela antiga para não confundir
        // await db.query(`DROP TABLE IF EXISTS avaliacoes;`);
        // console.log("🗑️ Tabela antiga 'avaliacoes' removida.");

    } catch (error) {
        console.error("❌ Erro:", error.message);
    } finally {
        process.exit();
    }
}

criarTabelaExames();