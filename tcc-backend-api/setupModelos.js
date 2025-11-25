const db = require('./db');

async function atualizarTabela() {
    console.log("🔄 Verificando e atualizando tabela de Modelos...");
    try {
        // 1. Adiciona a coluna 'campos' do tipo JSONB se ela não existir
        await db.query(`
            ALTER TABLE modelos 
            ADD COLUMN IF NOT EXISTS campos JSONB DEFAULT '[]';
        `);
        console.log("✅ Coluna 'campos' garantida com sucesso!");
        
        // 2. Opcional: Se a coluna já existia como texto simples e deu erro,
        // esse comando garante que ela aceite JSON (só roda se necessário)
        // await db.query(`ALTER TABLE modelos ALTER COLUMN campos TYPE JSONB USING campos::jsonb;`);

    } catch (error) {
        console.error("❌ Erro ao atualizar banco:", error.message);
    } finally {
        console.log("🏁 Processo finalizado.");
        process.exit();
    }
}

atualizarTabela();