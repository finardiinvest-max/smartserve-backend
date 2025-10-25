const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Cadastrar novo tenant
// @access  Public
router.post('/register', [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('tipo').isIn(['padaria', 'restaurante', 'bar', 'farmacia', 'acougue', 'mercado', 'outros'])
        .withMessage('Tipo inválido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], authController.register);

// @route   POST /api/auth/login
// @desc    Login de tenant
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória')
], authController.login);

// @route   POST /api/auth/master/login
// @desc    Login master
// @access  Public
router.post('/master/login', authController.loginMaster);

// @route   GET /api/auth/verify
// @desc    Verificar token
// @access  Private
router.get('/verify', auth, authController.verifyToken);

module.exports = router;

