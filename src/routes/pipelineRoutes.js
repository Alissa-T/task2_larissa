const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipelineController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de pipeline exigem autenticação do usuário
router.use(authMiddleware);

// Retorna as últimas estatísticas dos testes automatizados
router.get('/stats', pipelineController.getStats);

// Executa os testes automatizados e retorna novos resultados
router.post('/run', pipelineController.runTests);

// Retorna o status de conexão dos ambientes de Homolog e Prod + Qualidade de Código
router.get('/env-status', pipelineController.getEnvStatus);

module.exports = router;
