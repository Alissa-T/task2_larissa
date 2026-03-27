const express = require('express');
const router = express.Router();
const lancamentoController = require('../controllers/lancamentoController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de lançamento requerem autenticação
router.use(authMiddleware);

router.get('/', lancamentoController.listar);
router.get('/resumo', lancamentoController.resumo);
router.get('/:id', lancamentoController.buscarPorId);
router.post('/', lancamentoController.criar);
router.put('/:id', lancamentoController.atualizar);
router.delete('/:id', lancamentoController.excluir);

module.exports = router;
