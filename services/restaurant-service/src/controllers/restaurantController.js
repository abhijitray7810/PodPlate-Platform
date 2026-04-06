const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// Get restaurants with filters
const getRestaurants = async (req, res, next) => {
  try {
    const {
      city,
      cuisine,
      minRating = 0,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isOpen: true };

    if (city) query['address.city'] = city;
    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (minRating) query['rating.average'] = { $gte: Number(minRating) };

    const restaurants = await Restaurant.find(query)
      .sort({ 'rating.average': -1, rating: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      count: restaurants.length,
      total,
      restaurants
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant with menu
const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const menuItems = await MenuItem.find({
      restaurant: req.params.id,
      isAvailable: true
    }).populate('restaurant', 'name').lean();

    res.json({
      success: true,
      restaurant,
      menu: menuItems
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurant
};
