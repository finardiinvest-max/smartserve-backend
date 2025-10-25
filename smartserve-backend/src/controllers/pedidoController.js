const Pedido = require('../models/Pedido');
const Produto = require('../models/Produto');

// Gerar número de pedido
const gerarNumeroPedido = () => {
    const agora = new Date();
    const timestamp = agora.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
};

// Listar pedidos
exports.getPedidos = async (req, res) => {
    try {
        const { status, data } = req.query;
        
        const filtros = { tenantId: req.tenantId };
        
        if (status) filtros.status = status;
        if (data) {
            const dataInicio = new Date(data);
            dataInicio.setHours(0, 0, 0, 0);
            const dataFim = new Date(data);
            dataFim.setHours(23, 59, 59, 999);
            filtros.criadoEm = { $gte: dataInicio, $lte: dataFim };
        }
        
        const pedidos = await Pedido.find(filtros)
            .sort({ criadoEm: -1 })
            .limit(100);
        
        res.json({
            success: true,
            count: pedidos.length,
            pedidos
        });
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao listar pedidos.',
            error: error.message 
        });
    }
};

// Buscar pedido por ID
exports.getPedido = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pedido = await Pedido.findOne({
            _id: id,
            tenantId: req.tenantId
        }).populate('items.produtoId');
        
        if (!pedido) {
            return res.status(404).json({ 
                success: false,
                message: 'Pedido não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            pedido
        });
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar pedido.',
            error: error.message 
        });
    }
};

// Criar pedido (público - sistema cliente)
exports.createPedido = async (req, res) => {
    try {
        const { tenantId, cliente, items, tipoPedido, observacoes } = req.body;
        
        // Validar items
        if (!items || items.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Pedido deve ter pelo menos um item.' 
            });
        }
        
        // Calcular valores
        let subtotal = 0;
        const itemsProcessados = [];
        
        for (const item of items) {
            const produto = await Produto.findById(item.produtoId);
            
            if (!produto) {
                return res.status(404).json({ 
                    success: false,
                    message: `Produto ${item.produtoId} não encontrado.` 
                });
            }
            
            if (!produto.disponivel) {
                return res.status(400).json({ 
                    success: false,
                    message: `Produto "${produto.nome}" não está disponível.` 
                });
            }
            
            const itemSubtotal = produto.preco * item.quantidade;
            subtotal += itemSubtotal;
            
            itemsProcessados.push({
                produtoId: produto._id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: item.quantidade,
                subtotal: itemSubtotal,
                observacoes: item.observacoes
            });
            
            // Atualizar estoque se necessário
            if (produto.estoque.controlarEstoque) {
                produto.estoque.quantidade -= item.quantidade;
                await produto.save();
            }
        }
        
        // Buscar taxa de conveniência
        const Tenant = require('../models/Tenant');
        const tenant = await Tenant.findOne({ id: tenantId });
        const taxaConveniencia = tenant.pagamento.taxaConveniencia || 0;
        const valorTaxa = subtotal * (taxaConveniencia / 100);
        const total = subtotal + valorTaxa;
        
        // Criar pedido
        const pedido = new Pedido({
            tenantId,
            numero: gerarNumeroPedido(),
            cliente,
            items: itemsProcessados,
            subtotal,
            taxaConveniencia: valorTaxa,
            total,
            tipoPedido,
            observacoes
        });
        
        await pedido.save();
        
        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso!',
            pedido
        });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao criar pedido.',
            error: error.message 
        });
    }
};

// Atualizar status do pedido
exports.updateStatusPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const pedido = await Pedido.findOneAndUpdate(
            { _id: id, tenantId: req.tenantId },
            { status, atualizadoEm: new Date() },
            { new: true }
        );
        
        if (!pedido) {
            return res.status(404).json({ 
                success: false,
                message: 'Pedido não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            message: 'Status atualizado com sucesso!',
            pedido
        });
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao atualizar pedido.',
            error: error.message 
        });
    }
};

// Cancelar pedido
exports.cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pedido = await Pedido.findOneAndUpdate(
            { _id: id, tenantId: req.tenantId },
            { status: 'cancelado', atualizadoEm: new Date() },
            { new: true }
        );
        
        if (!pedido) {
            return res.status(404).json({ 
                success: false,
                message: 'Pedido não encontrado.' 
            });
        }
        
        // Devolver estoque
        for (const item of pedido.items) {
            const produto = await Produto.findById(item.produtoId);
            if (produto && produto.estoque.controlarEstoque) {
                produto.estoque.quantidade += item.quantidade;
                await produto.save();
            }
        }
        
        res.json({
            success: true,
            message: 'Pedido cancelado com sucesso!',
            pedido
        });
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao cancelar pedido.',
            error: error.message 
        });
    }
};

