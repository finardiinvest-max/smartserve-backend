const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
        index: true
    },
    numero: {
        type: String,
        required: true
    },
    cliente: {
        nome: {
            type: String,
            required: true
        },
        whatsapp: String,
        mesa: String
    },
    items: [{
        produtoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Produto'
        },
        nome: String,
        preco: Number,
        quantidade: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: Number,
        observacoes: String
    }],
    subtotal: {
        type: Number,
        required: true
    },
    taxaConveniencia: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pendente', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado'],
        default: 'pendente'
    },
    tipoPedido: {
        type: String,
        enum: ['mesa', 'retirada', 'delivery'],
        default: 'mesa'
    },
    pagamento: {
        metodo: {
            type: String,
            enum: ['dinheiro', 'pix', 'cartao', 'pendente'],
            default: 'pendente'
        },
        status: {
            type: String,
            enum: ['pendente', 'pago', 'cancelado'],
            default: 'pendente'
        },
        comprovante: String
    },
    observacoes: String,
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices
pedidoSchema.index({ tenantId: 1, status: 1 });
pedidoSchema.index({ tenantId: 1, criadoEm: -1 });
pedidoSchema.index({ numero: 1 });

module.exports = mongoose.model('Pedido', pedidoSchema);

