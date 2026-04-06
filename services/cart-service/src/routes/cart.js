const express = require('express');
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getCart);

router.route('/add').post(addToCart);
router.route('/update').put(updateCartItem);
router.route('/remove').delete(removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
