const express = require('express');
const NotificationController = require('../controllers/notificationController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(NotificationController.getNotifications);

router.route('/order/:orderId')
  .post(NotificationController.sendOrderConfirmation);

router.route('/payment/:transactionId')
  .post(NotificationController.sendPaymentSuccess);

router.route('/:id/read')
  .patch(NotificationController.markAsRead);

module.exports = router;
