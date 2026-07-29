import app from './app';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import { validateEnvironment } from './config/environment';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment variables
    validateEnvironment();

    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connection established');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`BloodBridge Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`Server URL: http://localhost:${PORT}`);
      logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Starting graceful shutdown...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Starting graceful shutdown...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
