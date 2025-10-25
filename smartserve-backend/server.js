require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Criar app Express
const app = express();

// Conectar ao MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Para permitir upload de imagens base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/tenant', require('./src/routes/tenant'));
app.use('/api/produto', require('./src/routes/produto'));
app.use('/api/pedido', require('./src/routes/pedido'));

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Serve BR API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tenant: '/api/tenant',
            produto: '/api/produto',
            pedido: '/api/pedido'
        }
    });
});

// Rota 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

