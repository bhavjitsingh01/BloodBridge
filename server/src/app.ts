import express, { Express, Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsConfig } from './middleware/corsConfig';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
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

// Health Check Route (before other routes)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'BloodBridge Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
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
