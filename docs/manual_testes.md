# Manual Oficial de Testes - Aplicação Financeira

Os testes utilizam o framework **Jest** em conjunto com **Supertest** para garantir que todas as transações, seguranças e inteligência de e-mail operem.

---

## 🚀 Como Executar os Testes

O ambiente de testes intercepta as rotas de banco de dados por padrão (`Mocks`), portanto você pode executá-los em qualquer máquina sem precisar poluir um banco real ou disparar falsos e-mails do Gmail.

### Execução Global (Roda todos os 20 testes de uma vez)
A forma fundamental sugerida para rotinas automatizadas como Pipelines em VMs.

Na raiz do projeto (onde está o `package.json`), abra o terminal e digite:

```bash
npm test
```
*O sistema varrerá a pasta `_tests_uni_` listando todas as suítes e imprimirá um checklist em verde com o total de sucessos.*

### Execução de um Teste Único (Arquivo Individual)
Como agora cada teste possui seu próprio arquivo, você pode rodar apenas um deles de forma extremamente rápida:

```bash
npx jest _tests_uni_/test_01_email_criacao.test.js
```

### Execução Filtrada por Nome
Ainda é possível rodar filtrando pelo título do teste:
```bash
npx jest -t "Roda de resumo totaliza ganhos e perdas"
```

---

## 🔎 Explicação dos 20 Testes

### ✉️ Utilitários de E-mail (`email.test.js`)
*Garantem que a geração dos recortes de HTML que são enviados aos usuários funcione limpidamente separadamente do banco de dados.*

*   **Teste 1 (`templateCriacao - HTML vital`)**: Avalia o template simulando a injeção um lançamento. Confirma se os marcadores verdes, os títulos em caixa alta (ex: RECEITA) e o valor local monetário convertido ("R$ 1.500,50") estão presentes adequadamente.
*   **Teste 2 (`templateExclusao - Retorno de estado`)**: Injeta dados de uma exclusão fictícia e garante que o template emite as palavras de cautela corretas (ex: "removido").
*   **Teste 3 (`templateEdicao - Exposição Mista (Antes/Depois)`)**: Passa dois objetos diferentes para a fórmula. Confirma a geração inteligente da tabela que aponta uma alteração (exibe visualmente o antigo de R$ 1.500 junto ao novo de R$ 2.000).
*   **Teste 4 (`templateEdicao - Aviso cego`)**: Simula um salvamento no painel sem alterar os campos originais. Verifica a ausência do quadro misto e a emissão do aviso padrão ("Nenhuma alteração de valor...").
*   **Teste 5 (`emailService - Fallback Graceful`)**: Adulteramos (mock) as variáveis `.env` temporariamente testando a inteligência da conexão; e então ele valida se o Nodemailer nega o envio de forma elegante sem crashear (travar/derrubar) os serviços da VM.

### 👥 Fluxo de Autenticação (`usuarios.test.js`)
*Desempenham tentativas locais forçadas contra a nossa malha de Endpoints (API).*

*   **Teste 6 (`Falha cadastro - Login Duplo`)**: Bate no router de cadastro de registro mas o Mock diz "já tenho usuário". Garante disparo do status `HTTP 400` pelo motor da base de dados.
*   **Teste 7 (`Sucesso cadastro - Assinatura e Criptografia Hash`)**: Ao inserir um painel verde com um mock limpo, comprova a injeção de ID, intercepta o SQL local enviado e **afirma expressivamente** que a senha enviada foi corrompida por Bcrypt propositalmente antes de descer para o BD. Garantia de segurança da transação.
*   **Teste 8 (`Falha Login - Usuário Vazio`)**: Bate na rota de "login" mandando login fantasma (que o mock ignora), retornando o Erro Global `401 Unauthorized`.
*   **Teste 9 (`Falha Login - Senha Vazia/Quebrada`)**: Envia conta válida com uma senha trocada em 1 caractere, testando a comparação lógica cruzada criptografada - negando sucesso e exibindo `401`.
*   **Teste 10 (`Sucesso Login - Handshake Session`)**: Teste mais importante! Autentica um modelo real simulado, avaliando o recebimento da mensagem final "Login com sucesso" emitindo um Cookie validador ID.

### 💰 Operações Financeiras e CRUD (`lancamentos.test.js`)
*Estes módulos operam no maior controlador da plataforma. Simulam uma conexão real com Cookie persistente do Administrador e tentam realizar todo o CRUD com base na interface.*

*   **Teste 11 (`Listar Lançamentos Vazio`)**: Envia o request por GET e garante que a tabela vazia seja traduzida como um Array limpo JSON `[]`.
*   **Teste 12 (`Listar Lançamentos Povoado`)**: Injeta dados falsos, atende chamada GET e valida integridade lendo o corpo dos arrays injetados em um status HTTP 200.
*   **Teste 13 (`Busca Lançamento ID Vazio`)**: Chama rota singular `/10` com o painel vazio; testa retorno restrito `404 Not Found`.
*   **Teste 14 (`Busca Lançamento ID Presente`)**: Envia pedido singular garantindo extração pura local isolada daquele item.
*   **Teste 15 (`Post Creation Incompleto`)**: Falha lógica em `/lancamentos` mandando request falho sem dados vitais essenciais para barrar DB injections na Controller; aguarda um status lógico code HTTP 400.
*   **Teste 16 (`Post Success & Background Dispatches`)**: Módulo super complexo de validação assíncrona; Confirma simulação inteira de Inserção, confirmação de Array gerado, e entra num delay microscópico para checar logicamente com contadores se o motor do **Nodemailer bateu sinal no background chamando a função sendEmail**.
*   **Teste 17 (`Put - Modificador Invalido DB/Constraint`)**: Valida resposta direta de um modelo forjado (erro SQL restrição interna ou falha semântica), gerando um fluxo de tratamento superior ou igual a um `400` validando proteção à API.
*   **Teste 18 (`Put Success Diff Background`)**: Simulação em cadeia total. Lê o MOCK antigo, faz override virtual via controller e reescreve localmente, simulando de volta em tempo real o envio de email da "diferença dos mocks". Super checagem.
*   **Teste 19 (`Soft Delete Flow`)**: Deleta identificador testando o Retorno SQL que muda a aba 'situacao', englobando com segurança status e trigger subsequente de notificação Email Exclusão.
*   **Teste 20 (`Math Sum Calculator Endpoint`)**: O EndPoint mais leve para painel gráfico. Solicita ao mock de query Builder (o modelo agrupador da database) o somatório. Valida se a rota intercepta isso no controller e repassa íntegro à tela sem contaminação externa (`saldo` puro).
