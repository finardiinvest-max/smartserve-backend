/**
 * ROTAS PÚBLICAS - SmartServe Backend
 * 
 * Adicione este arquivo ao seu backend em:
 * routes/public.js
 * 
 * Depois importe no server.js:
 * const publicRoutes = require('./routes/public');
 * app.use('/api/public', publicRoutes);
 */

const express = require('express');
const router = express.Router();

// Importar models (ajuste os caminhos conforme sua estrutura)
const Produto = require('../models/Produto');
const Tenant = require('../models/Tenant');
const Pedido = require('../models/Pedido');

// ==========================================
// IMPORTANTE: Estes endpoints NÃO usam middleware de autenticação
// Eles são públicos e acessíveis via QR Code
// ==========================================

/**
 * GET /api/public/:tenantId/produtos
 * Retorna todos os produtos de um tenant
 * Público - Sem autenticação
 */
router.get('/:tenantId/produtos', async (req, res) => {
    try {
        const { tenantId } = req.params;
        
        console.log('[Public API] Buscando produtos do tenant:', tenantId);
        
        // Buscar produtos do tenant no MongoDB
        const produtos = await Produto.find({ 
            tenantId: tenantId,
            // Opcional: filtrar apenas produtos disponíveis
            // disponivel: true
        }).select('-__v'); // Remove campo __v do Mongoose
        
        console.log(`[Public API] ${produtos.length} produtos encontrados`);
        
        res.json({
            success: true,
            produtos: produtos,
            total: produtos.length
        });
        
    } catch (error) {
        console.error('[Public API] Erro ao buscar produtos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produtos',
            error: error.message
        });
    }
});

/**
 * GET /api/public/:tenantId/config
 * Retorna configurações de um tenant
 * Público - Sem autenticação
 */
router.get('/:tenantId/config', async (req, res) => {
    try {
        const { tenantId } = req.params;
        
        console.log('[Public API] Buscando configurações do tenant:', tenantId);
        
        // Buscar tenant no MongoDB
        const tenant = await Tenant.findOne({ tenantId: tenantId });
        
        if (!tenant) {
            console.warn('[Public API] Tenant não encontrado:', tenantId);
            
            // Retornar configurações padrão se tenant não existir
            return res.json({
                success: true,
                config: {
                    sistemaAtivo: true,
                    taxaConveniencia: {
                        ativa: false,
                        porcentagem: 0
                    },
                    diasFuncionamento: {
                        domingo: false,
                        segunda: true,
                        terca: true,
                        quarta: true,
                        quinta: true,
                        sexta: true,
                        sabado: true
                    },
                    horarios: {
                        abertura: '08:00',
                        fechamento: '18:00'
                    }
                }
            });
        }
        
        console.log('[Public API] Configurações encontradas');
        
        // Retornar apenas campos necessários (não expor dados sensíveis)
        const config = {
            sistemaAtivo: tenant.sistemaAtivo !== false,
            taxaConveniencia: tenant.taxaConveniencia || { ativa: false, porcentagem: 0 },
            diasFuncionamento: tenant.diasFuncionamento || {},
            horarios: tenant.horarios || {},
            whatsappNotificacoes: tenant.whatsappNotificacoes || false
            // NÃO incluir: senha, chave PIX, dados bancários, etc.
        };
        
        res.json({
            success: true,
            config: config
        });
        
    } catch (error) {
        console.error('[Public API] Erro ao buscar configurações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar configurações',
            error: error.message
        });
    }
});

/**
 * POST /api/public/:tenantId/pedido
 * Cria um novo pedido
 * Público - Sem autenticação
 */
router.post('/:tenantId/pedido', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const pedidoData = req.body;
        
        console.log('[Public API] Criando pedido para tenant:', tenantId);
        console.log('[Public API] Dados do pedido:', JSON.stringify(pedidoData, null, 2));
        
        // Validações básicas
        if (!pedidoData.items || pedidoData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Pedido deve ter pelo menos um item'
            });
        }
        
        if (!pedidoData.total || pedidoData.total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Total do pedido inválido'
            });
        }
        
        if (!pedidoData.metodo_pagamento) {
            return res.status(400).json({
                success: false,
                message: 'Método de pagamento não informado'
            });
        }
        
        // Criar pedido no MongoDB
        const novoPedido = new Pedido({
            tenantId: tenantId,
            items: pedidoData.items,
            total: pedidoData.total,
            subtotal: pedidoData.subtotal || pedidoData.total,
            taxa_conveniencia: pedidoData.taxa_conveniencia || 0,
            metodo_pagamento: pedidoData.metodo_pagamento,
            nome: pedidoData.nome,
            mesa: pedidoData.mesa,
            horario_retirada: pedidoData.horario_retirada,
            observacoes: pedidoData.observacoes,
            status: pedidoData.metodo_pagamento === 'pix' ? 'Aguardando Pagamento' : 'Pendente',
            pagamento_confirmado: pedidoData.metodo_pagamento !== 'pix',
            data_criacao: new Date(),
            data_atualizacao: new Date()
        });
        
        await novoPedido.save();
        
        console.log('[Public API] Pedido criado com sucesso:', novoPedido._id);
        
        // Opcional: Enviar notificação para o admin
        // await enviarNotificacaoWhatsApp(tenantId, novoPedido);
        
        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            pedido: novoPedido
        });
        
    } catch (error) {
        console.error('[Public API] Erro ao criar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar pedido',
            error: error.message
        });
    }
});

module.exports = router;
