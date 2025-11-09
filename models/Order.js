const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  cliente: {
    nome: {
      type: String,
      required: true
    },
    telefone: {
      type: String,
      required: true
    },
    endereco: {
      type: String,
      required: false
    }
  },
  itens: [{
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    nome: String,
    preco: Number,
    quantidade: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: Number
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  formaPagamento: {
    type: String,
    required: true,
    enum: ['pix', 'dinheiro', 'cartao', 'retirada']
  },
  statusPagamento: {
    type: String,
    enum: ['pendente', 'confirmado', 'recusado'],
    default: 'pendente'
  },
  statusPedido: {
    type: String,
    enum: ['novo', 'em_preparo', 'pronto', 'entregue', 'cancelado'],
    default: 'novo'
  },
  observacoes: {
    type: String,
    default: ''
  },
  dataHora: {
    type: Date,
    default: Date.now
  },
  pixConfirmadoPeloCliente: {
    type: Boolean,
    default: false
  },
  pixConfirmadoPeloAdmin: {
    type: Boolean,
    default: false
  },
  dataConfirmacaoCliente: {
    type: Date
  },
  dataConfirmacaoAdmin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index para busca e ordenação
orderSchema.index({ numero: 1 });
orderSchema.index({ statusPedido: 1 });
orderSchema.index({ dataHora: -1 });

// PRE-SAVE HOOK REMOVIDO!
// O número do pedido agora é gerado na rota (routes/orders.js)
// Isso evita problemas com hooks assíncronos e race conditions

module.exports = mongoose.model('Order', orderSchema);
