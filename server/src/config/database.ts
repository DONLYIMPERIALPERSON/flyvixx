import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Game } from '../models/Game';
import { Bet } from '../models/Bet';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Accept self-signed certificates for development
  entities: [User, Game, Bet, Transaction, Notification],
  synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in dev
  logging: process.env.NODE_ENV === 'development',
  poolSize: 10,
  extra: {
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    statement_timeout: 60000,
  }
});

export const connectDatabase = async (): Promise<void> => {
  try {
    logger.info('🔄 Connecting to PostgreSQL database...');

    await AppDataSource.initialize();

    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};
