const express = require('express');
const { getRestaurants, getRestaurant } = require('../controllers/restaurantController');

const router = express.Router();

router
  .route('/')
  .get(getRestaurants);

router.route('/:id').get(getRestaurant);

module.exports = router;
