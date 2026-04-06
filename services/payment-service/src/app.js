require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3007;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Payment DB Connected'))
  .catch(err => console.error('❌ Payment DB Error'));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

app.use('/api/payment', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'payment-service' });
});

app.listen(PORT, () => {
  console.log(`💳 Payment Service (Mock) on port ${PORT}`);
});
