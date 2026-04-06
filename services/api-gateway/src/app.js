require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createLimiter } = require('./middleware/rateLimit');
const { requireAuth, optionalAuth } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const restaurantsRoutes = require('./routes/restaurants');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: 'http://localhost:3000',
  credentials: true 
}));

// Rate limiting
app.use('/api', createLimiter(15 * 60 * 1000, 100));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);           // Public
app.use('/api/products', productsRoutes);   // Public
app.use('/api/restaurants', restaurantsRoutes); // Public
app.use('/api/cart', cartRoutes);           // Optional auth
app.use('/api/users', requireAuth, usersRoutes);  // Protected
app.use('/api/orders', requireAuth, ordersRoutes); // Protected
app.use('/api/payments', requireAuth, paymentsRoutes); // Protected
app.use('/api/notifications', requireAuth, notificationsRoutes); // Protected

// Catch-all for 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on http://localhost:${PORT}`);
  console.log('✅ All services accessible via /api/*');
});
