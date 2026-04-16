# Documentação — Sistema Financeiro (Registro de Despesas e Receitas)

---
## Dados de acesso

Link de acesso à aplicação na VM: `http://177.44.248.108:3000/dashboard` <br>
Credenciais: Login `admin` / Senha `admin123` <br>
Acesso repositorio Github: `https://github.com/Alissa-T/task2_larissa#`

---

## 1. Sobre a Aplicação

### 1.1 Visão Geral

Sistema web para registro e gerenciamento de despesas e receitas pessoais, desenvolvido com **Node.js (Express)** no backend e **HTML/CSS/JavaScript** no frontend, utilizando **PostgreSQL** como banco de dados.

**Funcionalidades:**
- Autenticação de usuários (login/logout com sessão)
- CRUD completo de lançamentos financeiros (criar, listar, editar, excluir)
- Resumo financeiro com totais de receitas, despesas e saldo
- Filtro por tipo de lançamento (receita/despesa)

---

### 1.2 Estrutura e Classes da Aplicação

A aplicação possui **7 módulos/classes** principais:

| # | Arquivo | Tipo | Descrição |
|---|---------|------|-----------|
| 1 | `server.js` | Servidor | Configuração do Express, rotas e middlewares |
| 2 | `src/config/database.js` | Configuração | Pool de conexão com PostgreSQL |
| 3 | `src/middleware/auth.js` | Middleware | Verificação de autenticação por sessão |
| 4 | `src/controllers/lancamentoController.js` | Controller | CRUD de lançamentos + resumo financeiro |
| 5 | `src/controllers/usuarioController.js` | Controller | CRUD de usuários + login/logout |
| 6 | `src/routes/lancamentoRoutes.js` | Rotas | Endpoints da API de lançamentos |
| 7 | `src/routes/usuarioRoutes.js` | Rotas | Endpoints da API de usuários e autenticação |

**Estrutura de diretórios:**

```
task_2/
├── server.js
├── package.json
├── .env
├── .gitignore
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── lancamentoController.js
│   │   └── usuarioController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── lancamentoRoutes.js
│   │   └── usuarioRoutes.js
│   └── scripts/
│       └── seed.js
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── login.js
│       └── dashboard.js
└── docs/
    └── documentacao.md
```

---

### 1.3 Modelagem do Banco de Dados

O banco de dados **financeiro_db** contém 2 tabelas:

#### Tabela `usuario`

```sql
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    situacao VARCHAR(20) DEFAULT 'ativo'
);
```

| Coluna   | Tipo         | Restrições         | Descrição              |
|----------|--------------|--------------------|------------------------|
| id       | SERIAL       | PRIMARY KEY        | Identificador único    |
| nome     | VARCHAR(100) | NOT NULL           | Nome completo          |
| login    | VARCHAR(50)  | UNIQUE, NOT NULL   | Login de acesso        |
| senha    | VARCHAR(255) | NOT NULL           | Senha (hash bcrypt)    |
| situacao | VARCHAR(20)  | DEFAULT 'ativo'    | 'ativo' ou 'inativo'   |

#### Tabela `lancamento`

```sql
CREATE TABLE lancamento (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    data_lancamento DATE NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo_lancamento VARCHAR(20) NOT NULL CHECK (tipo_lancamento IN ('receita', 'despesa')),
    situacao VARCHAR(20) DEFAULT 'ativo'
);
```

| Coluna           | Tipo          | Restrições                          | Descrição                    |
|------------------|---------------|-------------------------------------|------------------------------|
| id               | SERIAL        | PRIMARY KEY                         | Identificador único          |
| descricao        | VARCHAR(255)  | NOT NULL                            | Descrição do lançamento      |
| data_lancamento  | DATE          | NOT NULL                            | Data do lançamento           |
| valor            | DECIMAL(10,2) | NOT NULL                            | Valor em reais               |
| tipo_lancamento  | VARCHAR(20)   | NOT NULL, CHECK (receita/despesa)   | Tipo: receita ou despesa     |
| situacao         | VARCHAR(20)   | DEFAULT 'ativo'                     | 'ativo' ou 'inativo'         |

#### Diagrama ER

```
┌──────────────────────┐       ┌────────────────────────────┐
│      usuario         │       │       lancamento            │
├──────────────────────┤       ├────────────────────────────┤
│ id (PK, SERIAL)      │       │ id (PK, SERIAL)            │
│ nome (VARCHAR 100)   │       │ descricao (VARCHAR 255)    │
│ login (VARCHAR 50)   │       │ data_lancamento (DATE)     │
│ senha (VARCHAR 255)  │       │ valor (DECIMAL 10,2)       │
│ situacao (VARCHAR 20)│       │ tipo_lancamento (VARCHAR 20)│
└──────────────────────┘       │ situacao (VARCHAR 20)      │
                               └────────────────────────────┘
```

#### Dados Iniciais (Seed)

**Usuário padrão:**
- Nome: Administrador
- Login: `admin`
- Senha: `admin123`

**10 Lançamentos iniciais:**

| # | Descrição | Data | Valor (R$) | Tipo |
|---|-----------|------|------------|------|
| 1 | Salário mensal | 01/03/2026 | 5.500,00 | Receita |
| 2 | Freelance - projeto web | 05/03/2026 | 2.800,00 | Receita |
| 3 | Aluguel do apartamento | 05/03/2026 | 1.800,00 | Despesa |
| 4 | Conta de energia | 10/03/2026 | 245,50 | Despesa |
| 5 | Supermercado | 12/03/2026 | 687,30 | Despesa |
| 6 | Venda de produto online | 14/03/2026 | 450,00 | Receita |
| 7 | Internet e telefone | 15/03/2026 | 159,90 | Despesa |
| 8 | Combustível | 18/03/2026 | 320,00 | Despesa |
| 9 | Rendimento investimentos | 20/03/2026 | 185,75 | Receita |
| 10 | Manutenção do carro | 22/03/2026 | 530,00 | Despesa |

### 1.4 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/sessao` | Verificar sessão ativa |
| GET | `/api/lancamentos` | Listar lançamentos ativos |
| GET | `/api/lancamentos/resumo` | Resumo financeiro (totais) |
| GET | `/api/lancamentos/:id` | Buscar lançamento por ID |
| POST | `/api/lancamentos` | Criar novo lançamento |
| PUT | `/api/lancamentos/:id` | Atualizar lançamento |
| DELETE | `/api/lancamentos/:id` | Excluir lançamento (soft delete) |

---

## 2. Publicação na VM

### 2.1 Instalação de Ferramentas na VM

#### 2.1.1 Atualizar o sistema (Ubuntu/Debian)

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2.2.2 Instalar Node.js (v20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### 2.2.3 Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2.2.4 Configurar o banco de dados

```bash
sudo -u postgres psql
```

No console do PostgreSQL:

```sql
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

#### 2.2.5 Instalar Git

```bash
sudo apt install -y git
```
---

### 2.3 Implantação da Aplicação

#### 2.3.1 Clonar o repositório

```bash
cd /home/<usuario>
git clone <URL_DO_REPOSITORIO> financeiro-app
cd financeiro-app
```

#### 2.3.2 Instalar dependências

```bash
npm install
```

#### 2.3.3 Configurar variáveis de ambiente

```bash
nano .env
```

Conteúdo do `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=financeiro_db
SESSION_SECRET=financeiro_secret_key_2024
PORT=3000
```

#### 2.3.4 Popular o banco de dados

```bash
npm run seed
```

#### 2.3.5 Iniciar a aplicação (background com PM2)

```bash
sudo npm install -g pm2
pm2 start server.js --name financeiro-app
pm2 save
pm2 startup
```

#### 2.3.6 Configurar firewall (liberar porta 3000)

```bash
sudo ufw allow 3000
```
---

### 2.4 URL de Acesso

- **URL:** `http://<IP_DA_VM>:3000`
- **Credenciais de acesso à aplicação:**
  - Login: `admin`
  - Senha: `admin123`

---

## 3. Tempos Gastos

| Etapa | Tempo Estimado |
|-------|---------------|
| Desenvolvimento da aplicação (backend + frontend) | 120 min |
| Criação do ambiente na VM (instalação de ferramentas) | 30 min |
| Publicação da aplicação na VM | 15 min |
| Documentação | 15 min |
| **Total** | **~180 min** |

---

## 4. Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Node.js    | 20.x   | Runtime JavaScript |
| Express.js | 4.21   | Framework web |
| PostgreSQL | 18.x   | Banco de dados |
| bcryptjs   | 2.4 | Hash de senhas |
| express-session | 1.18 | Gerenciamento de sessão |
| pg | 8.13 | Driver PostgreSQL para Node.js |
| HTML5/CSS3/JS | - | Frontend |