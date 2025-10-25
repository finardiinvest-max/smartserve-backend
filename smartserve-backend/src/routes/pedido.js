const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { auth } = require('../middleware/auth');

// Rotas públicas
// @route   POST /api/pedido
// @desc    Criar pedido (sistema cliente)
// @access  Public
router.post('/', pedidoController.createPedido);

// Rotas autenticadas
// @route   GET /api/pedido
// @desc    Listar pedidos do tenant
// @access  Private
router.get('/', auth, pedidoController.getPedidos);

// @route   GET /api/pedido/:id
// @desc    Buscar pedido por ID
// @access  Private
router.get('/:id', auth, pedidoController.getPedido);

// @route   PUT /api/pedido/:id/status
// @desc    Atualizar status do pedido
// @access  Private
router.put('/:id/status', auth, pedidoController.updateStatusPedido);

// @route   POST /api/pedido/:id/cancelar
// @desc    Cancelar pedido
// @access  Private
router.post('/:id/cancelar', auth, pedidoController.cancelarPedido);

module.exports = router;

