const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  nomeEstabelecimento: {
    type: String,
    required: true,
    default: 'Minha Padaria'
  },
  descricao: {
    type: String,
    default: 'Bem-vindo ao nosso cardápio digital'
  },
  telefone: {
    type: String,
    default: ''
  },
  endereco: {
    type: String,
    default: ''
  },
  chavePix: {
    type: String,
    default: ''
  },
  horarioFuncionamento: {
    type: String,
    default: 'Seg-Sex: 6h-20h | Sáb-Dom: 7h-18h'
  },
  corPrimaria: {
    type: String,
    default: '#FF6B35'
  },
  corSecundaria: {
    type: String,
    default: '#004E89'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  aceitaPedidos: {
    type: Boolean,
    default: true
  },
  mensagemFechado: {
    type: String,
    default: 'Desculpe, não estamos aceitando pedidos no momento.'
  },
  taxaConveniencia: {
    habilitada: {
      type: Boolean,
      default: false
    },
    percentual: {
      type: Number,
      enum: [2, 3, 5, 8, 10, 15],
      default: 5
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
