import express from 'express';
import axios from 'axios';
import { getServiceUrl } from '../services/serviceRegistry.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required()
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const response = await axios.post(`${getServiceUrl('auth')}/api/auth/register`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const response = await axios.post(`${getServiceUrl('auth')}/api/auth/login`, req.body, {
      headers: { Cookie: req.headers.cookie || '' }
    });
    // Forward Set-Cookie header from auth service
    if (response.headers['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/check-auth', async (req, res, next) => {
  try {
    const response = await axios.get(`${getServiceUrl('auth')}/api/auth/check-auth`, {
      headers: { Cookie: req.headers.cookie || '' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 401).json(error.response?.data);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const response = await axios.post(`${getServiceUrl('auth')}/api/auth/refresh`, req.body, {
      headers: { Cookie: req.headers.cookie || '' }
    });
    if (response.headers['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const response = await axios.post(`${getServiceUrl('auth')}/api/auth/logout`, {}, {
      headers: { 
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie || ''
      }
    });
    if (response.headers['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const response = await axios.get(`${getServiceUrl('auth')}/api/auth/profile`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

export default router;
