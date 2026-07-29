import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export function setupSecurityMiddleware(app: Express): void {
  // Helmet helps secure Express apps by setting HTTP response headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // General rate limiting: 100 requests per 15 minutes per IP
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/v1/health';
    },
  });

  app.use(generalLimiter);

  // Stricter rate limiting for authentication endpoints: 5 requests per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);

  // Rate limiting for API endpoints: 30 requests per minute per IP
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many API requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/', apiLimiter);

  // Prevent parameter pollution
  app.use((req, res, next) => {
    if (typeof req.query === 'object') {
      const keys = Object.keys(req.query);
      const uniqueKeys = new Set(keys);

      if (keys.length > uniqueKeys.size) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate query parameters detected',
        });
      }
    }
    return next();
  });

  // Trust proxy (for rate limiting to work correctly behind proxies)
  app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0);
}

export { helmet, cors, rateLimit };
