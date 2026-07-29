import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  SERVER_URL: z.string().url().default('http://localhost:5000'),

  // Database
  MONGODB_URI: z.string().url('MongoDB URI must be a valid URL'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRE: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRE: z.string().default('7d'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_PRODUCTION_URL: z.string().url().optional(),

  // CORS
  CORS_ENABLED: z.string().transform(val => val === 'true').default('true'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(15),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Email
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),

  // SMS (optional)
  SMS_PROVIDER: z.string().optional(),
  SMS_ACCOUNT_SID: z.string().optional(),
  SMS_AUTH_TOKEN: z.string().optional(),
  SMS_FROM_NUMBER: z.string().optional(),

  // AI Service
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_API_KEY: z.string().optional(),

  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  REDIS_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // Admin
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

// Parse and validate environment variables
const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  const errors = envResult.error.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error('Environment validation failed:\n', errors);
  process.exit(1);
}

const env = envResult.data;

/**
 * Validate environment variables on startup
 */
export function validateEnvironment(): void {
  if (!envResult.success) {
    const errors = envResult.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('Environment validation failed:\n', errors);
    process.exit(1);
  }
}

export default env;
