const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// Criar pedido (público)
router.post('/', async (req, res) => {
  try {
    const { cliente, itens, formaPagamento, observacoes, tipoRetirada, horarioRetirada } = req.body;

    // Validar dados
    if (!cliente?.nome || !cliente?.telefone) {
      return res.status(400).json({ error: 'Nome e telefone do cliente são obrigatórios.' });
    }

    if (!itens || itens.length === 0) {
      return res.status(400).json({ error: 'O pedido deve conter pelo menos um item.' });
    }

    // Buscar configurações
    const settings = await Settings.findOne();

    // Validar e calcular subtotal
    let subtotal = 0;
    const itensValidados = [];

    for (const item of itens) {
      const product = await Product.findById(item.produto);
      
      if (!product) {
        return res.status(400).json({ error: `Produto ${item.produto} não encontrado.` });
      }

      if (!product.disponivel) {
        return res.status(400).json({ error: `Produto ${product.nome} não está disponível.` });
      }

      const itemSubtotal = product.preco * item.quantidade;
      subtotal += itemSubtotal;

      itensValidados.push({
        produto: product._id,
        nome: product.nome,
        preco: product.preco,
        quantidade: item.quantidade,
        subtotal: itemSubtotal
      });
    }

    // Calcular taxa de conveniência
    let taxaConveniencia = { percentual: 0, valor: 0 };
    
    if (settings?.taxaConveniencia?.habilitada) {
      const percentual = settings.taxaConveniencia.percentual;
      const valor = parseFloat(((subtotal * percentual) / 100).toFixed(2));
      taxaConveniencia = { percentual, valor };
    }

    // Calcular total final
    const total = parseFloat((subtotal + taxaConveniencia.valor).toFixed(2));

    // Gerar número do pedido único (timestamp + random)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const numero = `${timestamp}${random}`.slice(-8);

    // Criar pedido
    const order = new Order({
      numero,
      cliente,
      itens: itensValidados,
      subtotal,
      taxaConveniencia,
      total,
      formaPagamento,
      observacoes: observacoes || '',
      statusPagamento: formaPagamento === 'pix' ? 'pendente' : 'confirmado',
      tipoRetirada: tipoRetirada || 'agora',
      horarioRetirada: horarioRetirada ? new Date(horarioRetirada) : null
    });

    await order.save();

    res.status(201).json({
      message: 'Pedido criado com sucesso!',
      order: {
        numero: order.numero,
        total: order.total,
        statusPedido: order.statusPedido,
        _id: order._id
      }
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao criar pedido.',
      details: error.message 
    });
  }
});

// Buscar pedido por número (público)
router.get('/numero/:numero', async (req, res) => {
  try {
    const order = await Order.findOne({ numero: req.params.numero })
      .populate('itens.produto');

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido.' });
  }
});

// Cliente confirma pagamento PIX (público)
router.patch('/:id/confirmar-pix-cliente', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (order.formaPagamento !== 'pix') {
      return res.status(400).json({ error: 'Este pedido não é via PIX.' });
    }

    order.pixConfirmadoPeloCliente = true;
    order.dataConfirmacaoCliente = new Date();
    await order.save();

    res.json({
      message: 'Confirmação de pagamento registrada! Aguarde a validação.',
      order
    });
  } catch (error) {
    console.error('Erro ao confirmar PIX:', error);
    res.status(500).json({ error: 'Erro ao confirmar pagamento.' });
  }
});

// Listar todos os pedidos (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, data } = req.query;
    
    let filter = {};
    if (status) filter.statusPedido = status;
    
    if (data) {
      const startDate = new Date(data);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(data);
      endDate.setHours(23, 59, 59, 999);
      filter.dataHora = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(filter)
      .populate('itens.produto')
      .sort({ dataHora: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// Buscar pedido por ID (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('itens.produto');

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido.' });
  }
});

// Atualizar status do pedido (admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { statusPedido } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { statusPedido },
      { new: true }
    ).populate('itens.produto');

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json({
      message: 'Status atualizado com sucesso!',
      order
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

// Admin confirma pagamento PIX (admin)
router.patch('/:id/confirmar-pix-admin', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (order.formaPagamento !== 'pix') {
      return res.status(400).json({ error: 'Este pedido não é via PIX.' });
    }

    order.pixConfirmadoPeloAdmin = true;
    order.dataConfirmacaoAdmin = new Date();
    order.statusPagamento = 'confirmado';
    
    // Se o pedido ainda está novo, muda para em preparo
    if (order.statusPedido === 'novo') {
      order.statusPedido = 'em_preparo';
    }

    await order.save();

    res.json({
      message: 'Pagamento confirmado com sucesso!',
      order
    });
  } catch (error) {
    console.error('Erro ao confirmar PIX:', error);
    res.status(500).json({ error: 'Erro ao confirmar pagamento.' });
  }
});

// Admin recusa pagamento PIX (admin)
router.patch('/:id/recusar-pix', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    order.statusPagamento = 'recusado';
    order.statusPedido = 'cancelado';
    await order.save();

    res.json({
      message: 'Pagamento recusado.',
      order
    });
  } catch (error) {
    console.error('Erro ao recusar PIX:', error);
    res.status(500).json({ error: 'Erro ao recusar pagamento.' });
  }
});

// Cancelar pedido (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { statusPedido: 'cancelado' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.json({ message: 'Pedido cancelado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ error: 'Erro ao cancelar pedido.' });
  }
});

module.exports = router;
