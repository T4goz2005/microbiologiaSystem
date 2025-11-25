const db = require('./db');

async function ajustarBanco() {
    console.log("🔄 Ajustando tabela 'avaliacoes'...");
    try {
        // 1. Cria a coluna 'respostas' se ela não existir
        await db.query(`
            ALTER TABLE avaliacoes 
            ADD COLUMN IF NOT EXISTS respostas JSONB DEFAULT '{}';
        `);
        console.log("✅ Coluna 'respostas' verificada.");

        // 2. Torna a coluna 'modelo_id' opcional (NULLABLE)
        // Isso é crucial porque o novo exame não usa modelos criados
        await db.query(`
            ALTER TABLE avaliacoes 
            ALTER COLUMN modelo_id DROP NOT NULL;
        `);
        console.log("✅ Coluna 'modelo_id' agora aceita NULL.");

    } catch (error) {
        console.error("⚠️ Erro ao ajustar:", error.message);
    } finally {
        process.exit();
    }
}

ajustarBanco();