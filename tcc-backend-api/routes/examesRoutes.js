const express = require('express');
const router = express.Router();
const exameController = require('../controllers/exameController');

// Rotas protegidas pelo JWT

// GET /api/exames (Geral - Todos os exames)
router.get('/', exameController.listarTodosExames);

// GET /api/exames/:pacienteId (Histórico por Paciente)
router.get('/:pacienteId', exameController.listarExamesPorPaciente);

// POST /api/exames (Criar novo exame)
router.post('/', exameController.criarExame);

// PUT /api/exames/:id (Editar exame existente)
router.put('/:id', exameController.atualizarExame);

router.delete('/:id', exameController.excluirExame);

module.exports = router;