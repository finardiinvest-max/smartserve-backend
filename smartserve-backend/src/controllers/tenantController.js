const Tenant = require('../models/Tenant');
const Produto = require('../models/Produto');
const Pedido = require('../models/Pedido');

// Buscar tenant por ID (público - para sistema cliente)
exports.getTenantPublic = async (req, res) => {
    try {
        const { id } = req.params;
        
        const tenant = await Tenant.findOne({ id }).select('-senha');
        
        if (!tenant) {
            return res.status(404).json({ 
                success: false,
                message: 'Estabelecimento não encontrado.' 
            });
        }
        
        // Verificar assinatura
        const statusAssinatura = tenant.verificarAssinatura();
        if (!statusAssinatura.ativo) {
            return res.status(403).json({ 
                success: false,
                message: 'Estabelecimento temporariamente indisponível.',
                assinatura: statusAssinatura
            });
        }
        
        res.json({
            success: true,
            tenant: {
                id: tenant.id,
                nome: tenant.nome,
                tipo: tenant.tipo,
                visual: tenant.visual,
                configuracoes: {
                    whatsapp: tenant.configuracoes.whatsapp,
                    horarioFuncionamento: tenant.configuracoes.horarioFuncionamento
                },
                pagamento: {
                    chavePix: tenant.pagamento.chavePix,
                    taxaConveniencia: tenant.pagamento.taxaConveniencia
                }
            }
        });
    } catch (error) {
        console.error('Erro ao buscar tenant:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar estabelecimento.',
            error: error.message 
        });
    }
};

// Buscar dados completos do tenant (autenticado)
exports.getTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ id: req.tenantId }).select('-senha');
        
        if (!tenant) {
            return res.status(404).json({ 
                success: false,
                message: 'Estabelecimento não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            tenant
        });
    } catch (error) {
        console.error('Erro ao buscar tenant:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar dados.',
            error: error.message 
        });
    }
};

// Atualizar tenant
exports.updateTenant = async (req, res) => {
    try {
        const updates = req.body;
        
        // Remover campos que não podem ser atualizados
        delete updates.id;
        delete updates.email;
        delete updates.senha;
        delete updates.assinatura;
        
        const tenant = await Tenant.findOneAndUpdate(
            { id: req.tenantId },
            { ...updates, atualizadoEm: new Date() },
            { new: true, runValidators: true }
        ).select('-senha');
        
        if (!tenant) {
            return res.status(404).json({ 
                success: false,
                message: 'Estabelecimento não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            message: 'Dados atualizados com sucesso!',
            tenant
        });
    } catch (error) {
        console.error('Erro ao atualizar tenant:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao atualizar dados.',
            error: error.message 
        });
    }
};

// Dashboard - estatísticas
exports.getDashboard = async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Pedidos de hoje
        const pedidosHoje = await Pedido.find({
            tenantId: req.tenantId,
            criadoEm: { $gte: hoje }
        });
        
        // Total de produtos
        const totalProdutos = await Produto.countDocuments({
            tenantId: req.tenantId
        });
        
        // Calcular faturamento
        const faturamentoHoje = pedidosHoje
            .filter(p => p.status !== 'cancelado')
            .reduce((sum, p) => sum + p.total, 0);
        
        // Status da assinatura
        const tenant = await Tenant.findOne({ id: req.tenantId });
        const statusAssinatura = tenant.verificarAssinatura();
        
        res.json({
            success: true,
            dashboard: {
                pedidosHoje: pedidosHoje.length,
                faturamentoHoje,
                totalProdutos,
                assinatura: statusAssinatura
            }
        });
    } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar estatísticas.',
            error: error.message 
        });
    }
};

// Listar todos os tenants (master)
exports.getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find().select('-senha').sort({ criadoEm: -1 });
        
        res.json({
            success: true,
            count: tenants.length,
            tenants
        });
    } catch (error) {
        console.error('Erro ao listar tenants:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao listar estabelecimentos.',
            error: error.message 
        });
    }
};

// Renovar assinatura (master)
exports.renovarAssinatura = async (req, res) => {
    try {
        const { id } = req.params;
        const { dias = 30 } = req.body;
        
        const tenant = await Tenant.findOne({ id });
        
        if (!tenant) {
            return res.status(404).json({ 
                success: false,
                message: 'Estabelecimento não encontrado.' 
            });
        }
        
        // Atualizar assinatura
        tenant.assinatura.status = 'ativo';
        tenant.assinatura.dataVencimento = new Date(Date.now() + dias*24*60*60*1000);
        tenant.assinatura.ultimoPagamento = new Date();
        tenant.assinatura.historicoPagamentos.push({
            data: new Date(),
            valor: tenant.assinatura.valor,
            metodo: 'manual',
            status: 'pago'
        });
        
        await tenant.save();
        
        res.json({
            success: true,
            message: 'Assinatura renovada com sucesso!',
            assinatura: tenant.assinatura
        });
    } catch (error) {
        console.error('Erro ao renovar assinatura:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao renovar assinatura.',
            error: error.message 
        });
    }
};

// Bloquear tenant (master)
exports.bloquearTenant = async (req, res) => {
    try {
        const { id } = req.params;
        
        const tenant = await Tenant.findOneAndUpdate(
            { id },
            { 'assinatura.status': 'bloqueado' },
            { new: true }
        ).select('-senha');
        
        if (!tenant) {
            return res.status(404).json({ 
                success: false,
                message: 'Estabelecimento não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            message: 'Estabelecimento bloqueado com sucesso!',
            tenant
        });
    } catch (error) {
        console.error('Erro ao bloquear tenant:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao bloquear estabelecimento.',
            error: error.message 
        });
    }
};

