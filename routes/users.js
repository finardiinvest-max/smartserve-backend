const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Listar todos os usuários (apenas admin autenticado)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-senha').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

// Criar novo usuário (apenas admin autenticado)
router.post('/', auth, async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está cadastrado.' });
    }

    // Criar usuário (o hash da senha é feito automaticamente pelo pre-save hook)
    const newUser = new User({
      nome,
      email,
      password: senha  // Usar 'password' conforme modelo
    });

    await newUser.save();

    // Retornar usuário sem a senha
    const userResponse = {
      _id: newUser._id,
      nome: newUser.nome,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: userResponse
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// Excluir usuário (apenas admin autenticado)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir excluir a si mesmo
    if (id === req.userId) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta.' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
