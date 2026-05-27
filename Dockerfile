# Dockerfile
# Imagem base oficial do Node.js LTS (Alpine para leveza)
FROM node:20-alpine

# Diretório de trabalho no container
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala as dependências de produção
RUN npm ci --only=production

# Copia os arquivos do projeto
COPY . .

# Expõe a porta interna da aplicação (3000)
EXPOSE 3000

# Comando para inicializar a aplicação
CMD ["npm", "start"]
