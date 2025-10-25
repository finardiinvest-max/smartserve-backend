const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    // Identificação
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['padaria', 'restaurante', 'bar', 'farmacia', 'acougue', 'mercado', 'outros']
    },
    
    // Autenticação
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    senha: {
        type: String,
        required: true
    },
    
    // Configurações Gerais
    configuracoes: {
        whatsapp: String,
        endereco: String,
        horarioFuncionamento: {
            segunda: { abre: String, fecha: String, fechado: Boolean },
            terca: { abre: String, fecha: String, fechado: Boolean },
            quarta: { abre: String, fecha: String, fechado: Boolean },
            quinta: { abre: String, fecha: String, fechado: Boolean },
            sexta: { abre: String, fecha: String, fechado: Boolean },
            sabado: { abre: String, fecha: String, fechado: Boolean },
            domingo: { abre: String, fecha: String, fechado: Boolean }
        }
    },
    
    // Visual
    visual: {
        logo: String, // Base64 ou URL
        corPrimaria: {
            type: String,
            default: '#D4AF37'
        },
        corSecundaria: {
            type: String,
            default: '#1a1a1a'
        }
    },
    
    // Pagamento
    pagamento: {
        chavePix: String,
        taxaConveniencia: {
            type: Number,
            default: 0
        }
    },
    
    // Assinatura
    assinatura: {
        status: {
            type: String,
            enum: ['trial', 'ativo', 'vencido', 'bloqueado', 'cancelado'],
            default: 'trial'
        },
        plano: {
            type: String,
            enum: ['mensal', 'trimestral', 'anual'],
            default: 'mensal'
        },
        valor: {
            type: Number,
            default: 49.90
        },
        dataInicio: {
            type: Date,
            default: Date.now
        },
        dataVencimento: {
            type: Date,
            default: () => new Date(Date.now() + 30*24*60*60*1000) // 30 dias
        },
        ultimoPagamento: Date,
        historicoPagamentos: [{
            data: Date,
            valor: Number,
            metodo: String,
            status: String
        }]
    },
    
    // Metadados
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    },
    ultimoAcesso: Date
}, {
    timestamps: true
});

// Índices
tenantSchema.index({ id: 1 });
tenantSchema.index({ email: 1 });
tenantSchema.index({ 'assinatura.status': 1 });

// Métodos
tenantSchema.methods.verificarAssinatura = function() {
    const agora = new Date();
    const vencimento = new Date(this.assinatura.dataVencimento);
    const diasRestantes = Math.ceil((vencimento - agora) / (1000 * 60 * 60 * 24));
    
    return {
        ativo: this.assinatura.status === 'ativo' || this.assinatura.status === 'trial',
        diasRestantes: Math.max(0, diasRestantes),
        vencido: diasRestantes < 0,
        status: this.assinatura.status
    };
};

module.exports = mongoose.model('Tenant', tenantSchema);

