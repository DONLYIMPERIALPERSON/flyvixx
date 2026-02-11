#!/usr/bin/env ts-node

import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../src/models/User';
import { Game } from '../src/models/Game';
import { Bet } from '../src/models/Bet';
import { Transaction } from '../src/models/Transaction';
import { Notification } from '../src/models/Notification';
import { Admin } from '../src/models/Admin';
import { CryptoRate } from '../src/models/CryptoRate';
import { CryptoService } from '../src/services/cryptoService';
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

// Create a separate DataSource for the script
// Use SSL for Aiven databases (detected by avnadmin user), otherwise respect NODE_ENV
const useSSL = process.env.DATABASE_URL?.includes('avnadmin') ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production');

const ScriptDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: useSSL,
  entities: [User, Game, Bet, Transaction, Notification, Admin, CryptoRate],
  synchronize: false, // Never synchronize in scripts
  logging: false,
  poolSize: 5,
  extra: {
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
    statement_timeout: 60000,
  }
});

async function updateCryptoRates() {
  try {
    logger.info('🔄 Starting crypto rates update...');

    // Connect to database
    await ScriptDataSource.initialize();
    logger.info('📦 Database connected for crypto rates update');

    // Create crypto service with script DataSource
    const { CryptoService } = await import('../src/services/cryptoService');
    const cryptoService = new CryptoService(ScriptDataSource);

    // Update rates
    await cryptoService.updateRates();

    // Close database connection
    await ScriptDataSource.destroy();
    logger.info('✅ Crypto rates update completed successfully');

  } catch (error) {
    logger.error('❌ Failed to update crypto rates:', error);
    throw error;
  }
}

async function main() {
  try {
    await updateCryptoRates();
  } catch (error) {
    logger.error('❌ Crypto rates update script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { updateCryptoRates };
