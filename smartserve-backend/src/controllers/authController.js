const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Tenant = require('../models/Tenant');

// Gerar slug único a partir do nome
const gerarSlug = (nome) => {
    return nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
        .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
};

// Cadastro de novo tenant
exports.register = async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        
        const { nome, tipo, email, senha } = req.body;
        
        // Verificar se email já existe
        const tenantExistente = await Tenant.findOne({ email });
        if (tenantExistente) {
            return res.status(400).json({ 
                success: false,
                message: 'Email já cadastrado.' 
            });
        }
        
        // Gerar slug único
        let slug = gerarSlug(nome);
        let contador = 1;
        while (await Tenant.findOne({ id: slug })) {
            slug = `${gerarSlug(nome)}-${contador}`;
            contador++;
        }
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        // Criar tenant
        const tenant = new Tenant({
            id: slug,
            nome,
            tipo,
            email,
            senha: senhaHash,
            configuracoes: {
                horarioFuncionamento: {
                    segunda: { abre: '08:00', fecha: '18:00', fechado: false },
                    terca: { abre: '08:00', fecha: '18:00', fechado: false },
                    quarta: { abre: '08:00', fecha: '18:00', fechado: false },
                    quinta: { abre: '08:00', fecha: '18:00', fechado: false },
                    sexta: { abre: '08:00', fecha: '18:00', fechado: false },
                    sabado: { abre: '08:00', fecha: '14:00', fechado: false },
                    domingo: { abre: '08:00', fecha: '12:00', fechado: true }
                }
            }
        });
        
        await tenant.save();
        
        // Gerar token
        const token = jwt.sign(
            { id: tenant._id, tenantId: tenant.id, email: tenant.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Conta criada com sucesso!',
            token,
            tenant: {
                id: tenant.id,
                nome: tenant.nome,
                tipo: tenant.tipo,
                email: tenant.email,
                assinatura: tenant.assinatura
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao criar conta.',
            error: error.message 
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        
        const { email, senha } = req.body;
        
        // Buscar tenant
        const tenant = await Tenant.findOne({ email });
        if (!tenant) {
            return res.status(401).json({ 
                success: false,
                message: 'Email ou senha incorretos.' 
            });
        }
        
        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, tenant.senha);
        if (!senhaValida) {
            return res.status(401).json({ 
                success: false,
                message: 'Email ou senha incorretos.' 
            });
        }
        
        // Verificar assinatura
        const statusAssinatura = tenant.verificarAssinatura();
        if (!statusAssinatura.ativo) {
            return res.status(403).json({ 
                success: false,
                message: 'Assinatura vencida ou bloqueada.',
                assinatura: statusAssinatura
            });
        }
        
        // Atualizar último acesso
        tenant.ultimoAcesso = new Date();
        await tenant.save();
        
        // Gerar token
        const token = jwt.sign(
            { id: tenant._id, tenantId: tenant.id, email: tenant.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso!',
            token,
            tenant: {
                id: tenant.id,
                nome: tenant.nome,
                tipo: tenant.tipo,
                email: tenant.email,
                assinatura: tenant.assinatura,
                visual: tenant.visual,
                configuracoes: tenant.configuracoes
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao fazer login.',
            error: error.message 
        });
    }
};

// Login Master
exports.loginMaster = async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        // Verificar credenciais master (hardcoded por segurança)
        if (email !== process.env.MASTER_EMAIL || senha !== process.env.MASTER_PASSWORD) {
            return res.status(401).json({ 
                success: false,
                message: 'Credenciais inválidas.' 
            });
        }
        
        // Gerar token master
        const token = jwt.sign(
            { email, role: 'master' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login master realizado com sucesso!',
            token,
            role: 'master'
        });
    } catch (error) {
        console.error('Erro no login master:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao fazer login.',
            error: error.message 
        });
    }
};

// Verificar token
exports.verifyToken = async (req, res) => {
    res.json({
        success: true,
        tenant: {
            id: req.tenant.id,
            nome: req.tenant.nome,
            tipo: req.tenant.tipo,
            email: req.tenant.email,
            assinatura: req.tenant.assinatura
        }
    });
};

