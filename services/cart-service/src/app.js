import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';

import { globalErrorHandler, notFoundHandler } from '../../shared/middleware/errorHandler.js';
import { corsConfig, securityHeaders, rateLimiters } from '../../shared/config/middleware.js';
import { requestLogger } from '../../shared/utils/logger.js';
import { sanitizeMongo, createUserRateLimiter, queryLimiter } from '../../shared/middleware/security.js';
import { routeTimeout } from '../../shared/middleware/performance.js';

import cartRoutes from './routes/cart.js';

const app = express();
const PORT = process.env.PORT || 3005;

// MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Cart DB Connected'))
  .catch(err => console.error('❌ Cart DB Error:', err.message));

// Redis — use env var, fall back to the Docker service name (never localhost)
const REDIS_URL = process.env.REDIS_URL || 'redis://:podplate_redis_pass@redis:6379';

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', err => console.error('❌ Redis Error:', err.message));
redisClient.on('connect', () => console.log('✅ Redis Connected'));
redisClient.on('reconnecting', () => console.warn('⚠️  Redis reconnecting...'));

redisClient.connect().catch(err => {
  console.error('❌ Redis connection failed:', err.message);
});

// Security middleware
app.use(securityHeaders);
app.use(sanitizeMongo);
app.use(corsConfig);

// Rate limiting
app.use('/api/cart', rateLimiters.standard);
app.use('/api', createUserRateLimiter(100, 15 * 60 * 1000));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging & Performance
app.use(requestLogger);
app.use(queryLimiter);
app.use(routeTimeout(30000));

// Health check — includes Redis status
app.get('/health', async (req, res) => {
  const redisOk = redisClient.isReady;
  res.status(redisOk ? 200 : 503).json({
    success: redisOk,
    message: redisOk ? 'Cart Service is healthy' : 'Cart Service degraded — Redis unavailable',
    service: 'cart-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dependencies: {
      redis: redisOk ? 'connected' : 'disconnected',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    }
  });
});

// API Routes
app.use('/api/cart', cartRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🛒 Cart Service on port ${PORT}`);
});