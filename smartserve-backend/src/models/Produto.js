const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
    tenantId: {
        type: String,
        required: true,
        index: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
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
    imagem: {
        type: String // Base64 ou URL
    },
    estoque: {
        quantidade: {
            type: Number,
            default: 0,
            min: 0
        },
        controlarEstoque: {
            type: Boolean,
            default: false
        }
    },
    disponivel: {
        type: Boolean,
        default: true
    },
    ordem: {
        type: Number,
        default: 0
    },
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
produtoSchema.index({ tenantId: 1, categoria: 1 });
produtoSchema.index({ tenantId: 1, disponivel: 1 });

module.exports = mongoose.model('Produto', produtoSchema);

