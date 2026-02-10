import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../src/models/User';
import { Game } from '../src/models/Game';
import { Bet } from '../src/models/Bet';
import { Transaction } from '../src/models/Transaction';
import { Notification } from '../src/models/Notification';
import { Admin } from '../src/models/Admin';
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
  entities: [User, Game, Bet, Transaction, Notification, Admin],
  synchronize: false, // Never synchronize in scripts
  logging: false,
  poolSize: 5,
  extra: {
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
    statement_timeout: 60000,
  }
});

async function resetDailyGiftsForLockedUsers() {
  try {
    logger.info('🎁 Starting daily gift reset for users with locked funds...');

    const userRepository = ScriptDataSource.getRepository(User);

    // Find all users with locked funds > 0
    // Note: TypeORM doesn't support direct > comparison with decimals, so we get all users and filter
    const allUsers = await userRepository.find({
      select: ['id', 'email', 'level', 'lockedFunds', 'dailyGifts', 'giftsLastReset']
    });

    // Filter users with locked funds > 0
    const eligibleUsers = allUsers.filter((user: User) => Number(user.lockedFunds) > 0);

    logger.info(`📊 Found ${eligibleUsers.length} users with locked funds to reset daily gifts for`);

    let resetCount = 0;
    let totalGiftsGiven = 0;

    for (const user of eligibleUsers) {
      try {
        // Calculate fresh daily gifts based on current level (level 1 = 2 gifts, level 2 = 4 gifts, etc.)
        const freshGifts = user.level * 2;

        // Replace existing gifts with fresh daily amount (old unused gifts disappear)
        user.dailyGifts = freshGifts;
        user.giftsLastReset = new Date();

        await userRepository.save(user);

        resetCount++;
        totalGiftsGiven += freshGifts;

        logger.info(`✅ Daily gift reset for user ${user.id} (${user.email}): ${freshGifts} fresh gifts (level ${user.level})`);
      } catch (userError) {
        logger.error(`❌ Failed to reset gifts for user ${user.id}:`, userError);
      }
    }

    logger.info(`🎁 Daily gift reset completed: ${resetCount} users received fresh gifts, ${totalGiftsGiven} total gifts distributed`);

  } catch (error) {
    logger.error('❌ Error during daily gift reset:', error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to database
    await ScriptDataSource.initialize();
    logger.info('📦 Database connected for daily gift reset');

    // Run the gift reset
    await resetDailyGiftsForLockedUsers();

    // Close database connection
    await ScriptDataSource.destroy();
    logger.info('✅ Daily gift reset script completed successfully');

  } catch (error) {
    logger.error('❌ Daily gift reset script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { resetDailyGiftsForLockedUsers };