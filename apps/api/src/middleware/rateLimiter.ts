import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
    statusCode: 429,
  },
});
