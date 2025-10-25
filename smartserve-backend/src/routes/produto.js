const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { auth } = require('../middleware/auth');

// Rotas públicas
// @route   GET /api/produto/:id/public
// @desc    Listar produtos públicos de um tenant
// @access  Public
router.get('/:id/public', produtoController.getProdutosPublic);

// Rotas autenticadas
// @route   GET /api/produto
// @desc    Listar produtos do tenant
// @access  Private
router.get('/', auth, produtoController.getProdutos);

// @route   GET /api/produto/categorias
// @desc    Listar categorias
// @access  Private
router.get('/categorias', auth, produtoController.getCategorias);

// @route   GET /api/produto/:id
// @desc    Buscar produto por ID
// @access  Private
router.get('/:id', auth, produtoController.getProduto);

// @route   POST /api/produto
// @desc    Criar produto
// @access  Private
router.post('/', auth, produtoController.createProduto);

// @route   PUT /api/produto/:id
// @desc    Atualizar produto
// @access  Private
router.put('/:id', auth, produtoController.updateProduto);

// @route   DELETE /api/produto/:id
// @desc    Deletar produto
// @access  Private
router.delete('/:id', auth, produtoController.deleteProduto);

module.exports = router;

