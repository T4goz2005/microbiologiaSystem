const db = require('./db');

async function atualizarTabelaPacientes() {
    console.log("🔄 Atualizando tabela de Pacientes...");
    try {
        // 1. Adicionar novos campos
        await db.query(`
            ALTER TABLE pacientes
            ADD COLUMN IF NOT EXISTS data_nascimento VARCHAR(20),
            ADD COLUMN IF NOT EXISTS nome_mae VARCHAR(255),
            ADD COLUMN IF NOT EXISTS data_coleta VARCHAR(20),
            ADD COLUMN IF NOT EXISTS sangue VARCHAR(20);
        `);
        console.log("✅ Colunas adicionadas.");

        // 2. Remover o Prontuário (Cuidado: isso apaga os dados dessa coluna)
        await db.query(`
            ALTER TABLE pacientes DROP COLUMN IF EXISTS prontuario;
        `);
        console.log("✅ Coluna 'prontuario' removida.");

    } catch (error) {
        console.error("❌ Erro:", error.message);
    } finally {
        process.exit();
    }
}

atualizarTabelaPacientes();