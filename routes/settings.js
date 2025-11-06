const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Buscar configurações (público)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações.' });
  }
});

// Atualizar configurações (admin)
router.put('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json({
      message: 'Configurações atualizadas com sucesso!',
      settings
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações.' });
  }
});

module.exports = router;
