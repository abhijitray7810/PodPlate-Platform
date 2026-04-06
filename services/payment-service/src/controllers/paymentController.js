const Transaction = require('../models/Transaction');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class PaymentController {
  // Create payment intent
  static async createPaymentIntent(req, res, next) {
    try {
      const { orderId, method, amount } = req.body;

      // Validate order exists
      const orderResponse = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`, {
        headers: { Authorization: req.headers.authorization }
      });

      const order = orderResponse.data.order;
      
      if (order.userId.toString() !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized order access'
        });
      }

      // Create transaction
      const transactionId = 'txn_' + uuidv4().slice(0, 8) + '_' + Date.now();
      
      const transaction = new Transaction({
        orderId,
        userId: req.userId,
        amount: order.totalAmount,
        method,
        gatewayTransactionId: transactionId,
        status: 'pending'
      });

      await transaction.save();

      // Mock client secret (for Stripe-like flow)
      const clientSecret = crypto.randomBytes(32).toString('hex');

      res.json({
        success: true,
        clientSecret,
        transactionId: transaction._id,
        amount: order.totalAmount,
        currency: 'INR'
      });
    } catch (error) {
      next(error);
    }
  }

  // Process payment (Frontend calls after card details)
  static async processPayment(req, res, next) {
    try {
      const { 
        orderId, 
        method, 
        cardNumber, 
        expiry, 
        cvv,
        transactionId 
      } = req.body;

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      // 90% success rate
      const isSuccess = Math.random() > 0.1;
      const status = isSuccess ? 'success' : 'failed';

      // Update transaction
      const transaction = await Transaction.findById(transactionId);
      transaction.status = status;
      
      if (isSuccess) {
        transaction.cardLast4 = cardNumber.slice(-4);
      }

      await transaction.save();

      if (isSuccess) {
        // Notify Order Service
        await axios.patch(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`, {
          status: 'confirmed',
          transactionId: transaction.gatewayTransactionId
        }, {
          headers: { Authorization: req.headers.authorization }
        });
      }

      res.json({
        success: isSuccess,
        status,
        transactionId: transaction.gatewayTransactionId,
        message: isSuccess 
          ? 'Payment successful!'
          : 'Payment failed. Please try again.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Payment processing failed'
      });
    }
  }

  // Payment callback (for webhooks)
  static async paymentCallback(req, res, next) {
    try {
      const { orderId, status, gatewayTransactionId } = req.body;

      const transaction = await Transaction.findOne({ 
        orderId, 
        gatewayTransactionId 
      });

      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      transaction.status = status;
      await transaction.save();

      // Update order status
      await axios.patch(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`, {
        status: status === 'success' ? 'confirmed' : 'cancelled'
      });

      res.json({ success: true, message: 'Callback processed' });
    } catch (error) {
      next(error);
    }
  }

  // Get payment history
  static async getPaymentHistory(req, res, next) {
    try {
      const transactions = await Transaction.find({ userId: req.userId })
        .populate('orderId', 'orderNumber totalAmount status')
        .sort({ createdAt: -1 })
        .limit(20);

      res.json({
        success: true,
        transactions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;
