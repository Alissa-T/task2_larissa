const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas
router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);
router.post('/register', usuarioController.criar);
router.get('/sessao', usuarioController.verificarSessao);

// Rotas protegidas
router.get('/', authMiddleware, usuarioController.listar);
router.post('/', authMiddleware, usuarioController.criar);
router.put('/:id', authMiddleware, usuarioController.atualizar);
router.delete('/:id', authMiddleware, usuarioController.excluir);

module.exports = router;
