import express, { Express, Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { corsConfig } from './middleware/corsConfig';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { setupSecurityMiddleware } from './middleware/securityMiddleware';
import { swaggerSpec } from './config/swagger';
import routes from './routes/index';

const app: Express = express();

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// HTTP Logger Middleware
app.use(morgan('combined'));

// CORS Configuration
app.use(corsConfig);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logger Middleware
app.use(requestLogger);

// Root health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'BloodBridge Backend Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    database: dbStatus,
    uptime: process.uptime(),
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api-docs.json',
  },
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use(routes);

// 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
