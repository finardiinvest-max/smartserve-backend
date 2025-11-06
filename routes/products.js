const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Listar todos os produtos (público)
router.get('/', async (req, res) => {
  try {
    const { categoria, disponivel } = req.query;
    
    let filter = {};
    if (categoria) filter.categoria = categoria;
    if (disponivel !== undefined) filter.disponivel = disponivel === 'true';

    const products = await Product.find(filter)
      .sort({ categoria: 1, ordem: 1, nome: 1 });

    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

// Buscar produto por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
});

// Criar produto (admin)
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      message: 'Produto criado com sucesso!',
      product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

// Atualizar produto (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json({
      message: 'Produto atualizado com sucesso!',
      product
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Deletar produto (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json({ message: 'Produto deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
});

// Alternar disponibilidade (admin)
router.patch('/:id/toggle-disponibilidade', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    product.disponivel = !product.disponivel;
    await product.save();

    res.json({
      message: 'Disponibilidade alterada com sucesso!',
      product
    });
  } catch (error) {
    console.error('Erro ao alterar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao alterar disponibilidade.' });
  }
});

module.exports = router;
