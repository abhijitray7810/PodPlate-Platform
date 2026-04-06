require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3008;

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔔 Notification DB Connected'))
  .catch(err => console.error('❌ Notification DB Error'));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'notification-service' });
});

app.listen(PORT, () => {
  console.log(`🔔 Notification Service on port ${PORT}`);
});
