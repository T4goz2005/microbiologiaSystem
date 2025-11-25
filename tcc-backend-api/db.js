// db.js
const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Sugestão: adicione um timeout para a conexão inicial
    connectionTimeoutMillis: 5000 
});

// Função para testar a conexão no momento da inicialização
// Usamos .once() para garantir que este código seja executado apenas uma vez.
pool.once('connect', (client) => {
    console.log('✅ Conexão inicial com o PostgreSQL estabelecida!');
    // Não é necessário chamar done() aqui, pois é um evento de pool
    // e o cliente será liberado automaticamente após o evento.
});

// Melhorando o tratamento de erros em tempo de execução
pool.on('error', (err, client) => {
    console.error('⚠️ Erro inesperado no Pool de Clientes do PostgreSQL:', err.stack);
    // Em produção, o processo deve ser encerrado ou um sistema de monitoramento alertado
});

// Exporta o pool e uma função utilitária para executar consultas
module.exports = {
    /**
     * Função wrapper para executar consultas SQL usando o pool.
     * @param {string} text - A query SQL.
     * @param {Array<any>} [params] - Parâmetros para a query.
     */
    query: (text, params) => pool.query(text, params),
    pool
};