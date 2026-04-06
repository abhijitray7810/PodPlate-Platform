require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');

const app = express();
const PORT = process.env.PORT || 3004;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Restaurant DB Connected'))
  .catch(err => console.error('❌ Restaurant DB Error'));

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/restaurants', restaurantRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'restaurant-service' });
});

app.listen(PORT, () => {
  console.log(`🚀 Restaurant Service on port ${PORT}`);
});
