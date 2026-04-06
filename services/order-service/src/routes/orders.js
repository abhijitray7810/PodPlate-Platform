const express = require('express');
const OrderController = require('../controllers/orderController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(OrderController.createOrder)
  .get(OrderController.getUserOrders);

router.route('/:id')
  .get(OrderController.getOrder)
  .patch(OrderController.updateOrderStatus);

module.exports = router;
