require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const lancamentoRoutes = require('./src/routes/lancamentoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const pipelineRoutes = require('./src/routes/pipelineRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    },
  })
);

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/lancamentos', lancamentoRoutes);
app.use('/api/auth', usuarioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pipeline', pipelineRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/usuarios', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'usuarios.html'));
});

app.get('/pipeline', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pipeline.html'));
});

// Iniciar servidor somente se não for um teste
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log(`📊 Dashboard: http://0.0.0.0:${PORT}/dashboard`);
  });
}

module.exports = app;
