const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Pegar token do header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

    // Adicionar usuário ao request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = auth;
