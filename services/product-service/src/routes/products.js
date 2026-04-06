const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct
} = require('../controllers/productController');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id').get(getProduct);

module.exports = router;
