# Smart Serve BR - Guia de Deploy

## 📋 Pré-requisitos

1. **MongoDB Atlas** (banco de dados)
2. **Railway.app** ou **Render.com** (hospedagem backend)
3. **Netlify** (frontend - já configurado)

---

## 🗄️ Passo 1: Configurar MongoDB Atlas

### 1.1 Criar Conta
1. Acessar https://www.mongodb.com/cloud/atlas/register
2. Criar conta grátis
3. Criar novo cluster (M0 Free Tier)

### 1.2 Configurar Acesso
1. Database Access → Add New Database User
   - Username: `smartserve`
   - Password: Gerar senha forte
   - Role: `Atlas admin`

2. Network Access → Add IP Address
   - Clicar "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirmar

### 1.3 Obter Connection String
1. Clusters → Connect → Connect your application
2. Copiar connection string:
   ```
   mongodb+srv://smartserve:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Substituir `<password>` pela senha criada
4. Adicionar nome do banco: `/smartserve` antes do `?`
   ```
   mongodb+srv://smartserve:senha@cluster0.xxxxx.mongodb.net/smartserve?retryWrites=true&w=majority
   ```

---

## 🚀 Passo 2: Deploy no Railway.app

### 2.1 Criar Conta
1. Acessar https://railway.app
2. Login com GitHub

### 2.2 Criar Novo Projeto
1. Clicar "New Project"
2. Selecionar "Deploy from GitHub repo"
3. Conectar repositório ou fazer upload manual

### 2.3 Configurar Variáveis de Ambiente
1. No projeto → Variables
2. Adicionar variáveis:

```
MONGODB_URI=mongodb+srv://smartserve:senha@cluster0.xxxxx.mongodb.net/smartserve?retryWrites=true&w=majority
JWT_SECRET=seu-segredo-super-secreto-mude-isso-em-producao-123456789
MASTER_EMAIL=admin@smartservebr.com
MASTER_PASSWORD=admin123
FRONTEND_URL=https://smartservebr.com
NODE_ENV=production
PORT=5000
```

### 2.4 Deploy
1. Railway detecta automaticamente Node.js
2. Instala dependências e inicia servidor
3. Aguardar deploy (2-3 minutos)
4. Copiar URL gerada: `https://smartserve-backend-production.up.railway.app`

---

## 🌐 Passo 3: Atualizar Frontend

### 3.1 Configurar URL da API
No frontend, criar arquivo `config.js`:

```javascript
const API_URL = 'https://smartserve-backend-production.up.railway.app/api';
```

### 3.2 Fazer Deploy no Netlify
1. Arrastar pasta `smartserve-multitenant` para Netlify
2. Aguardar deploy
3. Testar: https://smartservebr.com

---

## ✅ Passo 4: Testar Sistema

### 4.1 Testar API
```bash
curl https://smartserve-backend-production.up.railway.app
```

Deve retornar:
```json
{
  "success": true,
  "message": "Smart Serve BR API",
  "version": "1.0.0"
}
```

### 4.2 Testar Cadastro
```bash
curl -X POST https://smartserve-backend-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Padaria",
    "tipo": "padaria",
    "email": "teste@teste.com",
    "senha": "123456"
  }'
```

### 4.3 Testar no Frontend
1. Acessar https://smartservebr.com
2. Clicar "Começar Grátis"
3. Criar conta
4. Verificar se redireciona para admin
5. Testar adicionar produto

---

## 🔧 Alternativa: Deploy no Render.com (Grátis)

### Vantagens
- ✅ Plano grátis (sem custo)
- ✅ Fácil de configurar

### Desvantagens
- ⚠️ Servidor "dorme" após 15 min de inatividade
- ⚠️ Primeiro acesso após "dormir" demora ~30s

### Passos
1. Acessar https://render.com
2. New → Web Service
3. Conectar repositório GitHub
4. Configurar:
   - Name: `smartserve-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Adicionar variáveis de ambiente (mesmas do Railway)
6. Create Web Service

---

## 📊 Monitoramento

### Railway
- Dashboard → Metrics
- Ver uso de CPU, memória, requests

### MongoDB Atlas
- Clusters → Metrics
- Ver conexões, storage usado

### Logs
**Railway**:
- Dashboard → Deployments → View Logs

**Render**:
- Dashboard → Logs

---

## 💰 Custos Mensais

| Serviço | Plano | Custo |
|---------|-------|-------|
| MongoDB Atlas | M0 Free | $0 |
| Railway | Hobby | $5/mês |
| Netlify | Free | $0 |
| **TOTAL** | | **$5/mês** |

**Alternativa grátis**:
- Render.com (grátis) + MongoDB Atlas (grátis) + Netlify (grátis) = **$0/mês**

---

## 🔐 Segurança

### Recomendações
1. ✅ Mudar `JWT_SECRET` para valor aleatório forte
2. ✅ Mudar `MASTER_PASSWORD` para senha forte
3. ✅ Ativar 2FA no MongoDB Atlas
4. ✅ Fazer backup regular do banco de dados
5. ✅ Monitorar logs de acesso

### Gerar JWT_SECRET Seguro
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to MongoDB"
- Verificar connection string
- Verificar se IP está liberado (0.0.0.0/0)
- Verificar senha do usuário

### Erro: "CORS"
- Verificar `FRONTEND_URL` nas variáveis de ambiente
- Deve ser exatamente: `https://smartservebr.com` (sem barra no final)

### Erro: "Token inválido"
- Verificar se `JWT_SECRET` é o mesmo no backend
- Limpar localStorage do navegador
- Fazer login novamente

### API não responde
- Verificar logs no Railway/Render
- Verificar se deploy foi bem-sucedido
- Testar URL da API no navegador

---

## 📞 Suporte

Documentação completa: `API-DOCUMENTATION.md`

Problemas? Verificar logs:
- Railway: Dashboard → Logs
- Render: Dashboard → Logs
- MongoDB: Atlas → Monitoring

