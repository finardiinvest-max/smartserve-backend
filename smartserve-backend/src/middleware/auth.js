const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');

// Middleware para verificar token JWT
const auth = async (req, res, next) => {
    try {
        // Pegar token do header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Acesso negado. Token não fornecido.' 
            });
        }
        
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar tenant
        const tenant = await Tenant.findOne({ _id: decoded.id });
        
        if (!tenant) {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido.' 
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
        
        // Adicionar tenant ao request
        req.tenant = tenant;
        req.tenantId = tenant.id;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token inválido.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expirado.' 
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Erro no servidor.',
            error: error.message 
        });
    }
};

// Middleware para verificar se é admin/master
const authMaster = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Acesso negado.' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar se é master
        if (decoded.role !== 'master') {
            return res.status(403).json({ 
                success: false,
                message: 'Acesso negado. Apenas administradores.' 
            });
        }
        
        req.masterEmail = decoded.email;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: 'Token inválido.' 
        });
    }
};

module.exports = { auth, authMaster };

