const Produto = require('../models/Produto');

// Listar produtos
exports.getProdutos = async (req, res) => {
    try {
        const { categoria, disponivel } = req.query;
        
        const filtros = { tenantId: req.tenantId };
        
        if (categoria) filtros.categoria = categoria;
        if (disponivel !== undefined) filtros.disponivel = disponivel === 'true';
        
        const produtos = await Produto.find(filtros).sort({ ordem: 1, nome: 1 });
        
        res.json({
            success: true,
            count: produtos.length,
            produtos
        });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao listar produtos.',
            error: error.message 
        });
    }
};

// Listar produtos públicos (para sistema cliente)
exports.getProdutosPublic = async (req, res) => {
    try {
        const { id } = req.params;
        
        const produtos = await Produto.find({
            tenantId: id,
            disponivel: true
        }).sort({ ordem: 1, nome: 1 });
        
        res.json({
            success: true,
            count: produtos.length,
            produtos
        });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao listar produtos.',
            error: error.message 
        });
    }
};

// Buscar produto por ID
exports.getProduto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const produto = await Produto.findOne({
            _id: id,
            tenantId: req.tenantId
        });
        
        if (!produto) {
            return res.status(404).json({ 
                success: false,
                message: 'Produto não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            produto
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao buscar produto.',
            error: error.message 
        });
    }
};

// Criar produto
exports.createProduto = async (req, res) => {
    try {
        const produtoData = {
            ...req.body,
            tenantId: req.tenantId
        };
        
        const produto = new Produto(produtoData);
        await produto.save();
        
        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso!',
            produto
        });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao criar produto.',
            error: error.message 
        });
    }
};

// Atualizar produto
exports.updateProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Não permitir alterar tenantId
        delete updates.tenantId;
        
        const produto = await Produto.findOneAndUpdate(
            { _id: id, tenantId: req.tenantId },
            { ...updates, atualizadoEm: new Date() },
            { new: true, runValidators: true }
        );
        
        if (!produto) {
            return res.status(404).json({ 
                success: false,
                message: 'Produto não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            message: 'Produto atualizado com sucesso!',
            produto
        });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao atualizar produto.',
            error: error.message 
        });
    }
};

// Deletar produto
exports.deleteProduto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const produto = await Produto.findOneAndDelete({
            _id: id,
            tenantId: req.tenantId
        });
        
        if (!produto) {
            return res.status(404).json({ 
                success: false,
                message: 'Produto não encontrado.' 
            });
        }
        
        res.json({
            success: true,
            message: 'Produto excluído com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao deletar produto.',
            error: error.message 
        });
    }
};

// Listar categorias
exports.getCategorias = async (req, res) => {
    try {
        const categorias = await Produto.distinct('categoria', {
            tenantId: req.tenantId
        });
        
        res.json({
            success: true,
            categorias
        });
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao listar categorias.',
            error: error.message 
        });
    }
};

