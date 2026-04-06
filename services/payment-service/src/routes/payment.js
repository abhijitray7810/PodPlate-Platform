const express = require('express');
const PaymentController = require('../controllers/paymentController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/intent', PaymentController.createPaymentIntent);
router.post('/process', PaymentController.processPayment);
router.post('/callback', PaymentController.paymentCallback);
router.get('/history', PaymentController.getPaymentHistory);

module.exports = router;
