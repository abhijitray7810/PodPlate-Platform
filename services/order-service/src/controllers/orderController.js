const Order = require('../models/Order');
const axios = require('axios');
const { validateOrder } = require('../utils/validators');

class OrderController {
  // Create order from cart
  static async createOrder(req, res, next) {
    try {
      const { shippingAddress, paymentMethod, notes } = req.body;
      
      // Validation
      const { error } = validateOrder({ 
        items: req.body.items, 
        shippingAddress, 
        paymentMethod 
      });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // Get user profile for address validation
      const userProfile = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/profile`, {
        headers: { Authorization: req.headers.authorization }
      });

      // Get cart
      const cartResponse = await axios.get(`${process.env.CART_SERVICE_URL}/api/cart`, {
        headers: { Authorization: req.headers.authorization }
      });

      const cart = cartResponse.data.cart;
      
      if (cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Calculate totals
      const subtotal = cart.totalAmount;
      const tax = subtotal * 0.18; // 18% GST
      const shipping = 50;
      const totalAmount = subtotal + tax + shipping;

      // Create order
      const order = new Order({
        userId: req.userId,
        items: cart.items.map(item => ({
          ...item,
          _id: undefined // Remove Mongo _id
        })),
        shippingAddress,
        payment: {
          method: paymentMethod,
          amount: totalAmount,
          status: 'pending'
        },
        subtotal,
        tax,
        shipping,
        totalAmount
      });

      if (notes) order.notes = notes;
      
      await order.save();

      // Clear cart after order creation
      await axios.delete(`${process.env.CART_SERVICE_URL}/api/cart/clear`, {
        headers: { Authorization: req.headers.authorization }
      });

      res.status(201).json({
        success: true,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user orders
  static async getUserOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const orders = await Order.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .populate('items.productId', 'name')
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await Order.countDocuments({ userId: req.userId });

      res.json({
        success: true,
        count: orders.length,
        total,
        orders: orders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single order
  static async getOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      next(error);
    }
  }

  // Update order status (Admin/Payment callback)
  static async updateOrderStatus(req, res, next) {
    try {
      const { status, transactionId } = req.body;
      
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Update payment status if provided
      if (transactionId) {
        order.payment.status = 'paid';
        order.payment.transactionId = transactionId;
      }

      // Update order status
      order.status = status;

      await order.save();

      res.json({
        success: true,
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.payment.status
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
