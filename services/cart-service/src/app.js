require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 3005;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Cart DB Connected'))
  .catch(err => console.error('❌ Cart DB Error'));

// Redis (install: brew install redis or docker)
console.log('🔴 Redis required: redis://localhost:6379');

// Middleware
app.use(cors({ 
  origin: 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/cart', cartRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'cart-service' });
});

app.listen(PORT, () => {
  console.log(`🛒 Cart Service on port ${PORT}`);
});
