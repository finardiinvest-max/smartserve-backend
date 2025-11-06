# SmartServe Backend - Sistema Simplificado

Backend simplificado para sistema de pedidos online (single-tenant).

## 🚀 Tecnologias

- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticação
- bcryptjs para hash de senhas

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure as variáveis de ambiente:

```env
PORT=5000
MONGODB_URI=sua_connection_string_mongodb
JWT_SECRET=seu_secret_aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 📡 Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token (requer autenticação)

### Produtos
- `GET /api/products` - Listar produtos (público)
- `GET /api/products/:id` - Buscar produto (público)
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)
- `PATCH /api/products/:id/toggle-disponibilidade` - Alternar disponibilidade (admin)

### Pedidos
- `POST /api/orders` - Criar pedido (público)
- `GET /api/orders/numero/:numero` - Buscar por número (público)
- `PATCH /api/orders/:id/confirmar-pix-cliente` - Cliente confirma PIX (público)
- `GET /api/orders` - Listar pedidos (admin)
- `GET /api/orders/:id` - Buscar pedido (admin)
- `PATCH /api/orders/:id/status` - Atualizar status (admin)
- `PATCH /api/orders/:id/confirmar-pix-admin` - Admin confirma PIX (admin)
- `PATCH /api/orders/:id/recusar-pix` - Admin recusa PIX (admin)
- `DELETE /api/orders/:id` - Cancelar pedido (admin)

### Configurações
- `GET /api/settings` - Buscar configurações (público)
- `PUT /api/settings` - Atualizar configurações (admin)

### Outros
- `GET /health` - Health check
- `GET /` - Informações da API

## 🔐 Autenticação

Rotas protegidas requerem token JWT no header:
```
Authorization: Bearer seu_token_aqui
```

## 📝 Modelos

### User
- email, password, nome, role, ativo

### Product
- nome, descricao, preco, categoria, imagemUrl, disponivel, destaque, ordem

### Order
- numero, cliente, itens, total, formaPagamento, statusPagamento, statusPedido, observacoes

### Settings
- nomeEstabelecimento, descricao, telefone, endereco, chavePix, horarioFuncionamento, cores, etc.

## 🚀 Deploy no Render

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## 📄 Licença

MIT
