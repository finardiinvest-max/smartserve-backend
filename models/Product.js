const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: String,
    required: true,
    enum: ['paes', 'doces-e-bolos', 'salgados', 'bebidas', 'pizzas', 'refeicoes', 'lanches-e-beirutes', 'omeletes', 'bebidas-matinais', 'lanches-matinais']
  },
  imagemUrl: {
    type: String,
    default: ''
  },
  disponivel: {
    type: Boolean,
    default: true
  },
  destaque: {
    type: Boolean,
    default: false
  },
  ordem: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index para busca e ordenação
productSchema.index({ categoria: 1, ordem: 1 });
productSchema.index({ disponivel: 1 });

module.exports = mongoose.model('Product', productSchema);
