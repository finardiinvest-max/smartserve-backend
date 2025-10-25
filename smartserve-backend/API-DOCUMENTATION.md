# Smart Serve BR - API Documentation

## Base URL
```
Production: https://your-api.railway.app
Development: http://localhost:5000
```

## Authentication

Todas as rotas privadas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### POST /api/auth/register
Cadastrar novo tenant

**Body**:
```json
{
  "nome": "Padaria do João",
  "tipo": "padaria",
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Conta criada com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {
    "id": "padaria-do-joao",
    "nome": "Padaria do João",
    "tipo": "padaria",
    "email": "joao@email.com",
    "assinatura": {...}
  }
}
```

#### POST /api/auth/login
Login de tenant

**Body**:
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant": {...}
}
```

#### POST /api/auth/master/login
Login master

**Body**:
```json
{
  "email": "admin@smartservebr.com",
  "senha": "admin123"
}
```

#### GET /api/auth/verify
Verificar token (requer autenticação)

---

### Tenant

#### GET /api/tenant/:id/public
Buscar dados públicos do tenant (para sistema cliente)

**Response** (200):
```json
{
  "success": true,
  "tenant": {
    "id": "padaria-do-joao",
    "nome": "Padaria do João",
    "tipo": "padaria",
    "visual": {
      "logo": "data:image/png;base64,...",
      "corPrimaria": "#D4AF37",
      "corSecundaria": "#1a1a1a"
    },
    "configuracoes": {...},
    "pagamento": {...}
  }
}
```

#### GET /api/tenant
Buscar dados completos do tenant (requer autenticação)

#### PUT /api/tenant
Atualizar tenant (requer autenticação)

**Body**:
```json
{
  "visual": {
    "logo": "data:image/png;base64,...",
    "corPrimaria": "#FF0000"
  },
  "configuracoes": {
    "whatsapp": "5511999999999"
  }
}
```

#### GET /api/tenant/dashboard
Dashboard com estatísticas (requer autenticação)

**Response** (200):
```json
{
  "success": true,
  "dashboard": {
    "pedidosHoje": 15,
    "faturamentoHoje": 450.50,
    "totalProdutos": 45,
    "assinatura": {
      "ativo": true,
      "diasRestantes": 25,
      "status": "ativo"
    }
  }
}
```

#### GET /api/tenant/master/all
Listar todos os tenants (requer autenticação master)

#### POST /api/tenant/master/:id/renovar
Renovar assinatura (requer autenticação master)

**Body**:
```json
{
  "dias": 30
}
```

#### POST /api/tenant/master/:id/bloquear
Bloquear tenant (requer autenticação master)

---

### Produtos

#### GET /api/produto/:id/public
Listar produtos públicos de um tenant (para sistema cliente)

**Response** (200):
```json
{
  "success": true,
  "count": 10,
  "produtos": [
    {
      "_id": "...",
      "tenantId": "padaria-do-joao",
      "nome": "Pão Francês",
      "categoria": "Pães",
      "preco": 0.80,
      "imagem": "data:image/png;base64,...",
      "disponivel": true
    }
  ]
}
```

#### GET /api/produto
Listar produtos do tenant (requer autenticação)

**Query params**:
- `categoria`: Filtrar por categoria
- `disponivel`: true/false

#### POST /api/produto
Criar produto (requer autenticação)

**Body**:
```json
{
  "nome": "Pão Francês",
  "categoria": "Pães",
  "descricao": "Pão francês fresquinho",
  "preco": 0.80,
  "imagem": "data:image/png;base64,...",
  "estoque": {
    "quantidade": 100,
    "controlarEstoque": true
  },
  "disponivel": true
}
```

#### PUT /api/produto/:id
Atualizar produto (requer autenticação)

#### DELETE /api/produto/:id
Deletar produto (requer autenticação)

#### GET /api/produto/categorias
Listar categorias (requer autenticação)

---

### Pedidos

#### POST /api/pedido
Criar pedido (público - sistema cliente)

**Body**:
```json
{
  "tenantId": "padaria-do-joao",
  "cliente": {
    "nome": "Maria Silva",
    "whatsapp": "5511999999999",
    "mesa": "5"
  },
  "items": [
    {
      "produtoId": "...",
      "quantidade": 2,
      "observacoes": "Sem cebola"
    }
  ],
  "tipoPedido": "mesa",
  "observacoes": "Urgente"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Pedido criado com sucesso!",
  "pedido": {
    "numero": "123456789",
    "cliente": {...},
    "items": [...],
    "subtotal": 10.00,
    "taxaConveniencia": 0.50,
    "total": 10.50,
    "status": "pendente"
  }
}
```

#### GET /api/pedido
Listar pedidos do tenant (requer autenticação)

**Query params**:
- `status`: pendente, confirmado, preparando, pronto, entregue, cancelado
- `data`: YYYY-MM-DD

#### GET /api/pedido/:id
Buscar pedido por ID (requer autenticação)

#### PUT /api/pedido/:id/status
Atualizar status do pedido (requer autenticação)

**Body**:
```json
{
  "status": "preparando"
}
```

#### POST /api/pedido/:id/cancelar
Cancelar pedido (requer autenticação)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token inválido ou expirado"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Assinatura vencida ou bloqueada",
  "assinatura": {...}
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Recurso não encontrado"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Erro interno do servidor"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

