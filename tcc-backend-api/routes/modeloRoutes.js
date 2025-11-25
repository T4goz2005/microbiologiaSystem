// 1. Importando o Express
const express = require('express');

// 2. Criando o Roteador
const router = express.Router();

// 3. Importando o "Cérebro" (Controller)
const modeloController = require('../controllers/modeloController');

// 4. Definindo as Rotas (Caminhos)

// Rota GET: Quando o app pedir para LER dados (GET /)
router.get('/', modeloController.listarModelos);

// Rota POST: Quando o app pedir para CRIAR dados (POST /)
router.post('/', modeloController.criarModelo);

// Rotas que exigem ID (Editar e Excluir)
// O '/:id' é fundamental para capturar o ID da URL (ex: /api/modelos/1)
router.put('/:id', modeloController.atualizarModelo);
router.delete('/:id', modeloController.excluirModelo);


// 5. Exportando para o servidor principal usar
module.exports = router;






//Frontend (App) manda um pedido: "Quero ver os modelos!" (GET /api/modelos).

//index.js recebe e vê: "Opa, é para /api/modelos? Vou mandar para o arquivo modeloRoutes.js".

//ModeloRoutes.js recebe e vê: "É um método GET? Então chame o cozinheiro listarModelos no Controller".

//Controller vai ao banco de dados, pega os dados e devolve.