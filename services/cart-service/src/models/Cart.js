const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return this.type === 'product'; }
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return this.type === 'menu'; }
  },
  type: {
    type: String,
    enum: ['product', 'menu'],
    required: true
  },
  name: String,
  image: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId // For menu items
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    sparse: true // Allow multiple docs for same user during merge
  },
  sessionId: String, // Guest cart
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
