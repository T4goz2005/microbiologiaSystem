const express = require('express'); 
const cors = require('cors');
require('dotenv').config();

// 1. Importações de Módulos
const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');

// Importação das Rotas
// ⚠️ CORREÇÃO: Ajustado para 'pacientesRoutes'. Se o seu arquivo for 'pacientes.js', mude de volta.
const pacienteRoutes = require('./routes/pacientesRoutes'); 
const exameRoutes = require('./routes/examesRoutes'); // 🆕 Nova rota de exames (Corrigido para examesRoutes.js)
const authRoutes = require('./routes/authRoutes');

// Se você ainda quiser manter os modelos antigos por segurança, descomente abaixo:
// const modeloRoutes = require('./routes/modeloRoutes'); 

// 2. Configuração Inicial do Servidor
const app = express();
const PORT = process.env.API_PORT || 3001;

// 3. Middlewares Globais
app.use(cors({
    origin: process.env.REACT_APP_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); 

// 4. Definição das Rotas

// Rota de teste (Pública)
app.get('/', (req, res) => {
    res.send('API do TCC Rodando. Acesse /api/login, /api/pacientes ou /api/exames.');
});

// A. Rotas Públicas (Autenticação)
app.use('/api', authRoutes);

// B. Rotas Protegidas (Dados e CRUD)
app.use('/api/pacientes', authMiddleware, pacienteRoutes);
app.use('/api/exames', authMiddleware, exameRoutes); // 🆕 Endpoint Novo

// 🚑 CORREÇÃO IMEDIATA: Redireciona a rota antiga para a nova lógica
// Isso faz com que chamadas para /api/avaliacoes funcionem usando o controller de exames
app.use('/api/avaliacoes', authMiddleware, exameRoutes); 

// Rota de modelos (Opcional/Legado)
// app.use('/api/modelos', authMiddleware, modeloRoutes);

// 5. Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor API rodando e acessível em http://0.0.0.0:${PORT}`);
});