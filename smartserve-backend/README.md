# Smart Serve BR - Backend API

Sistema completo de gestão de pedidos para padarias, restaurantes e comércio em geral.

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **MongoDB** + **Mongoose** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **express-validator** - Validação de dados

## 📁 Estrutura do Projeto

```
smartserve-backend/
├── src/
│   ├── models/          # Modelos do banco de dados
│   │   ├── Tenant.js    # Estabelecimentos
│   │   ├── Produto.js   # Produtos do cardápio
│   │   └── Pedido.js    # Pedidos
│   ├── controllers/     # Lógica de negócio
│   │   ├── authController.js
│   │   ├── tenantController.js
│   │   ├── produtoController.js
│   │   └── pedidoController.js
│   ├── routes/          # Rotas da API
│   │   ├── auth.js
│   │   ├── tenant.js
│   │   ├── produto.js
│   │   └── pedido.js
│   ├── middleware/      # Middlewares
│   │   └── auth.js      # Autenticação JWT
│   └── config/          # Configurações
│       └── database.js  # Conexão MongoDB
├── server.js            # Servidor principal
├── package.json
├── .env.example         # Exemplo de variáveis de ambiente
├── API-DOCUMENTATION.md # Documentação da API
├── DEPLOY-GUIDE.md      # Guia de deploy
└── README.md
```

## 🛠️ Instalação Local

### 1. Clonar repositório
```bash
git clone https://github.com/seu-usuario/smartserve-backend.git
cd smartserve-backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Editar `.env` com suas credenciais:
```env
MONGODB_URI=mongodb://localhost:27017/smartserve
JWT_SECRET=seu-segredo-aqui
MASTER_EMAIL=admin@smartservebr.com
MASTER_PASSWORD=admin123
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
PORT=5000
```

### 4. Iniciar servidor
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

Servidor rodando em: http://localhost:5000

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastrar tenant
- `POST /api/auth/login` - Login tenant
- `POST /api/auth/master/login` - Login master
- `GET /api/auth/verify` - Verificar token

### Tenant
- `GET /api/tenant/:id/public` - Dados públicos
- `GET /api/tenant` - Dados completos (auth)
- `PUT /api/tenant` - Atualizar (auth)
- `GET /api/tenant/dashboard` - Dashboard (auth)
- `GET /api/tenant/master/all` - Listar todos (master)
- `POST /api/tenant/master/:id/renovar` - Renovar assinatura (master)
- `POST /api/tenant/master/:id/bloquear` - Bloquear (master)

### Produtos
- `GET /api/produto/:id/public` - Listar públicos
- `GET /api/produto` - Listar (auth)
- `POST /api/produto` - Criar (auth)
- `PUT /api/produto/:id` - Atualizar (auth)
- `DELETE /api/produto/:id` - Deletar (auth)
- `GET /api/produto/categorias` - Listar categorias (auth)

### Pedidos
- `POST /api/pedido` - Criar (público)
- `GET /api/pedido` - Listar (auth)
- `GET /api/pedido/:id` - Buscar (auth)
- `PUT /api/pedido/:id/status` - Atualizar status (auth)
- `POST /api/pedido/:id/cancelar` - Cancelar (auth)

**Documentação completa**: `API-DOCUMENTATION.md`

## 🔐 Autenticação

Rotas privadas requerem token JWT no header:
```
Authorization: Bearer <token>
```

Obter token:
1. Fazer login: `POST /api/auth/login`
2. Copiar token da resposta
3. Usar em requisições subsequentes

## 🧪 Testes

### Testar API
```bash
# Rota raiz
curl http://localhost:5000

# Cadastro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Padaria",
    "tipo": "padaria",
    "email": "teste@teste.com",
    "senha": "123456"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@teste.com",
    "senha": "123456"
  }'
```

## 🚀 Deploy

### Railway.app ($5/mês)
1. Criar conta em https://railway.app
2. New Project → Deploy from GitHub
3. Configurar variáveis de ambiente
4. Deploy automático

### Render.com (Grátis)
1. Criar conta em https://render.com
2. New → Web Service
3. Conectar repositório
4. Configurar variáveis de ambiente
5. Deploy

**Guia completo**: `DEPLOY-GUIDE.md`

## 📊 Modelos de Dados

### Tenant
```javascript
{
  id: String,              // slug único
  nome: String,
  tipo: String,            // padaria, restaurante, etc.
  email: String,
  senha: String,           // hash bcrypt
  visual: {
    logo: String,
    corPrimaria: String,
    corSecundaria: String
  },
  configuracoes: {...},
  pagamento: {...},
  assinatura: {
    status: String,        // trial, ativo, vencido, bloqueado
    dataVencimento: Date,
    ...
  }
}
```

### Produto
```javascript
{
  tenantId: String,
  nome: String,
  categoria: String,
  preco: Number,
  imagem: String,
  estoque: {
    quantidade: Number,
    controlarEstoque: Boolean
  },
  disponivel: Boolean
}
```

### Pedido
```javascript
{
  tenantId: String,
  numero: String,
  cliente: {
    nome: String,
    whatsapp: String,
    mesa: String
  },
  items: [{
    produtoId: ObjectId,
    nome: String,
    preco: Number,
    quantidade: Number,
    subtotal: Number
  }],
  subtotal: Number,
  taxaConveniencia: Number,
  total: Number,
  status: String,          // pendente, confirmado, preparando, pronto, entregue, cancelado
  tipoPedido: String       // mesa, retirada, delivery
}
```

## 🔧 Desenvolvimento

### Adicionar nova rota
1. Criar controller em `src/controllers/`
2. Criar rota em `src/routes/`
3. Registrar rota em `server.js`

### Adicionar novo modelo
1. Criar modelo em `src/models/`
2. Importar em controllers necessários

### Middleware de autenticação
```javascript
const { auth } = require('./middleware/auth');

router.get('/rota-privada', auth, controller.metodo);
```

## 📝 Scripts

```bash
npm start      # Iniciar servidor (produção)
npm run dev    # Iniciar com nodemon (desenvolvimento)
npm test       # Executar testes (não implementado)
```

## 🐛 Troubleshooting

### Erro de conexão MongoDB
- Verificar `MONGODB_URI` no `.env`
- Verificar se MongoDB está rodando (local)
- Verificar whitelist de IPs (Atlas)

### Erro JWT
- Verificar `JWT_SECRET` no `.env`
- Token expirado? Fazer login novamente

### Porta em uso
- Mudar `PORT` no `.env`
- Ou matar processo: `lsof -ti:5000 | xargs kill`

## 📄 Licença

ISC

## 👨‍💻 Autor

Smart Serve BR Team

---

**Versão**: 1.0.0  
**Status**: ✅ Produção  
**Última atualização**: Outubro 2025

