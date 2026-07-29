import mongoose, { Connection } from 'mongoose';
import env from './environment';
import logger from '../utils/logger';

let connection: Connection | null = null;

/**
 * Connect to MongoDB
 */
export async function connectDatabase(): Promise<Connection> {
  if (connection) {
    logger.info('Already connected to MongoDB');
    return connection;
  }

  try {
    logger.info('Connecting to MongoDB...');

    const mongooseConnection = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4
    });

    connection = mongooseConnection.connection;

    logger.info('MongoDB connected successfully');

    // Set up connection event handlers
    connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    if (env.NODE_ENV === 'development') {
      logger.warn('MongoDB not available. Running in development mode with mock data.');
      return mongoose.connection;
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  if (connection) {
    try {
      await mongoose.disconnect();
      connection = null;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

/**
 * Get current database connection
 */
export function getConnection(): Connection {
  if (!connection) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return connection;
}

/**
 * Drop entire database (for testing only)
 */
export async function dropDatabase(): Promise<void> {
  if (env.NODE_ENV !== 'test') {
    throw new Error('dropDatabase() can only be called in test environment');
  }

  try {
    const conn = getConnection();
    await conn.dropDatabase();
    logger.info('Database dropped successfully');
  } catch (error) {
    logger.error('Error dropping database:', error);
    throw error;
  }
}

export default {
  connectDatabase,
  disconnectDatabase,
  getConnection,
  dropDatabase,
};
