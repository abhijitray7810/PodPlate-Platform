const express = require('express');
const axios = require('axios');
const { getServiceUrl } = require('../services/serviceRegistry');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

const createOrderSchema = Joi.object({
  shippingAddress: Joi.object().required(),
  paymentMethod: Joi.string().valid('card', 'cod', 'wallet').required()
});

router.post('/', requireAuth, validate(createOrderSchema), async (req, res, next) => {
  try {
    const response = await axios.post(`${getServiceUrl('orders')}/api/orders`, req.body, {
      headers: { Authorization: `Bearer ${req.accessToken}` }
    });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const response = await axios.get(`${getServiceUrl('orders')}/api/orders`, {
      params: req.query,
      headers: { Authorization: `Bearer ${req.accessToken}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

module.exports = router;
