const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Relatório de taxas de conveniência
router.get('/taxas-conveniencia', auth, async (req, res) => {
  try {
    const { periodo, data } = req.query;
    
    // Validar período
    if (!['diario', 'semanal', 'mensal'].includes(periodo)) {
      return res.status(400).json({ error: 'Período inválido. Use: diario, semanal ou mensal.' });
    }

    // Data de referência (padrão: hoje)
    const dataReferencia = data ? new Date(data) : new Date();
    
    let dataInicio, dataFim;

    // Calcular intervalo baseado no período
    if (periodo === 'diario') {
      dataInicio = new Date(dataReferencia);
      dataInicio.setHours(0, 0, 0, 0);
      dataFim = new Date(dataReferencia);
      dataFim.setHours(23, 59, 59, 999);
    } else if (periodo === 'semanal') {
      // Início da semana (domingo)
      dataInicio = new Date(dataReferencia);
      dataInicio.setDate(dataReferencia.getDate() - dataReferencia.getDay());
      dataInicio.setHours(0, 0, 0, 0);
      
      // Fim da semana (sábado)
      dataFim = new Date(dataInicio);
      dataFim.setDate(dataInicio.getDate() + 6);
      dataFim.setHours(23, 59, 59, 999);
    } else if (periodo === 'mensal') {
      // Primeiro dia do mês
      dataInicio = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth(), 1);
      dataInicio.setHours(0, 0, 0, 0);
      
      // Último dia do mês
      dataFim = new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0);
      dataFim.setHours(23, 59, 59, 999);
    }

    // Buscar pedidos no período
    const pedidos = await Order.find({
      dataHora: { $gte: dataInicio, $lte: dataFim },
      statusPedido: { $ne: 'cancelado' }
    });

    // Calcular métricas
    const totalPedidos = pedidos.length;
    const pedidosComTaxa = pedidos.filter(p => p.taxaConveniencia?.valor > 0).length;
    const totalTaxas = pedidos.reduce((sum, p) => sum + (p.taxaConveniencia?.valor || 0), 0);
    const taxaMedia = pedidosComTaxa > 0 ? totalTaxas / pedidosComTaxa : 0;

    // Agrupar por dia para detalhamento
    const detalhes = {};
    
    pedidos.forEach(pedido => {
      const dia = new Date(pedido.dataHora).toISOString().split('T')[0];
      
      if (!detalhes[dia]) {
        detalhes[dia] = {
          data: dia,
          pedidos: 0,
          pedidosComTaxa: 0,
          taxas: 0
        };
      }
      
      detalhes[dia].pedidos++;
      if (pedido.taxaConveniencia?.valor > 0) {
        detalhes[dia].pedidosComTaxa++;
        detalhes[dia].taxas += pedido.taxaConveniencia.valor;
      }
    });

    // Converter para array e ordenar por data
    const detalhesArray = Object.values(detalhes).sort((a, b) => 
      new Date(a.data) - new Date(b.data)
    );

    // Formatar valores monetários
    const response = {
      periodo,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      totalPedidos,
      pedidosComTaxa,
      totalTaxas: parseFloat(totalTaxas.toFixed(2)),
      taxaMedia: parseFloat(taxaMedia.toFixed(2)),
      detalhes: detalhesArray.map(d => ({
        ...d,
        taxas: parseFloat(d.taxas.toFixed(2))
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de taxas.' });
  }
});

// Relatório resumido (para dashboard)
router.get('/taxas-resumo', auth, async (req, res) => {
  try {
    // Últimos 30 dias
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);
    dataInicio.setHours(0, 0, 0, 0);

    const pedidos = await Order.find({
      dataHora: { $gte: dataInicio },
      statusPedido: { $ne: 'cancelado' }
    });

    const pedidosComTaxa = pedidos.filter(p => p.taxaConveniencia?.valor > 0);
    const totalTaxas = pedidosComTaxa.reduce((sum, p) => sum + p.taxaConveniencia.valor, 0);

    // Hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const pedidosHoje = pedidos.filter(p => new Date(p.dataHora) >= hoje);
    const taxasHoje = pedidosHoje.reduce((sum, p) => sum + (p.taxaConveniencia?.valor || 0), 0);

    res.json({
      ultimos30Dias: {
        totalPedidos: pedidos.length,
        pedidosComTaxa: pedidosComTaxa.length,
        totalTaxas: parseFloat(totalTaxas.toFixed(2))
      },
      hoje: {
        totalPedidos: pedidosHoje.length,
        totalTaxas: parseFloat(taxasHoje.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo de taxas.' });
  }
});

module.exports = router;
