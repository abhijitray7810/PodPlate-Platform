require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3003;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Product DB Connected'))
  .catch(err => console.error('❌ Product DB Error:', err));

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/products', productRoutes);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'product-service' });
});

app.listen(PORT, () => {
  console.log(`🚀 Product Service on port ${PORT}`);
});
