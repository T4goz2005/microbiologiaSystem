// routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

// Rota GET: /api/pacientes (lista com a interação entre tabelas)
router.get('/', pacienteController.listarPacientesComAvaliacoes);

// Rota POST: /api/pacientes (cadastro simples)
router.post('/', pacienteController.cadastrarPaciente);

// 🆕 NOVA ROTA DELETE
router.delete('/:id', pacienteController.excluirPaciente);

router.put('/:id', pacienteController.atualizarPaciente);


module.exports = router;