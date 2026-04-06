require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3006;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Order DB Connected'))
  .catch(err => console.error('❌ Order DB Error'));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'order-service' });
});

app.listen(PORT, () => {
  console.log(`📦 Order Service on port ${PORT}`);
});
