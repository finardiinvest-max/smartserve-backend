const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { auth, authMaster } = require('../middleware/auth');

// Rotas públicas
// @route   GET /api/tenant/:id/public
// @desc    Buscar dados públicos do tenant
// @access  Public
router.get('/:id/public', tenantController.getTenantPublic);

// Rotas autenticadas
// @route   GET /api/tenant
// @desc    Buscar dados completos do tenant
// @access  Private
router.get('/', auth, tenantController.getTenant);

// @route   PUT /api/tenant
// @desc    Atualizar tenant
// @access  Private
router.put('/', auth, tenantController.updateTenant);

// @route   GET /api/tenant/dashboard
// @desc    Dashboard com estatísticas
// @access  Private
router.get('/dashboard', auth, tenantController.getDashboard);

// Rotas master
// @route   GET /api/tenant/master/all
// @desc    Listar todos os tenants
// @access  Master
router.get('/master/all', authMaster, tenantController.getAllTenants);

// @route   POST /api/tenant/master/:id/renovar
// @desc    Renovar assinatura
// @access  Master
router.post('/master/:id/renovar', authMaster, tenantController.renovarAssinatura);

// @route   POST /api/tenant/master/:id/bloquear
// @desc    Bloquear tenant
// @access  Master
router.post('/master/:id/bloquear', authMaster, tenantController.bloquearTenant);

module.exports = router;

