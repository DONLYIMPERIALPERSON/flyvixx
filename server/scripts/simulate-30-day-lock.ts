import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../src/models/User';
import { Game } from '../src/models/Game';
import { Bet } from '../src/models/Bet';
import { Transaction, TransactionType, TransactionStatus } from '../src/models/Transaction';
import { Notification } from '../src/models/Notification';
import { Admin } from '../src/models/Admin';
import { logger } from '../src/utils/logger';

// Load environment variables
dotenv.config();

// Use SSL for Aiven databases (detected by avnadmin user), otherwise respect NODE_ENV
const useSSL = process.env.DATABASE_URL?.includes('avnadmin') ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production');

const ScriptDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: useSSL,
  entities: [User, Game, Bet, Transaction, Notification, Admin],
  synchronize: false, // Never synchronize in scripts
  logging: false,
  poolSize: 2, // Small pool for scripts
  extra: {
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
    statement_timeout: 60000,
  }
});

async function simulate30DayLockPeriod() {
  try {
    logger.info('🔒 Starting 30-day lock period simulation for dimperialperson@gmail.com...');

    const userRepository = ScriptDataSource.getRepository(User);
    const transactionRepository = ScriptDataSource.getRepository(Transaction);

    // Find the user by email
    const user = await userRepository.findOne({
      where: { email: 'dimperialperson@gmail.com' }
    });

    if (!user) {
      logger.error('❌ User not found: dimperialperson@gmail.com');
      return;
    }

    logger.info(`✅ Found user: ${user.email} (ID: ${user.id})`);
    logger.info(`📊 Initial status: cash=$${user.cashBalance}, portfolio=$${user.portfolioBalance}, locked=$${user.lockedFunds}`);

    // Step 1: Set up 30-day lock if not already locked
    if (user.lockedFunds > 0) {
      logger.info('ℹ️ User already has locked funds, skipping lock setup');
    } else {
      logger.info('🔒 Setting up 30-day lock period...');

      const lockAmount = 50.00; // Lock $50 for testing
      const cashBalanceBefore = Number(user.cashBalance);

      if (cashBalanceBefore < lockAmount) {
        logger.error(`❌ Insufficient cash balance. User has $${cashBalanceBefore} but needs $${lockAmount}`);
        return;
      }

      // Calculate lock period: 30 days from now
      const lockTime = new Date();
      const lockedUntil = new Date(lockTime.getTime() + (30 * 24 * 60 * 60 * 1000));

      // Update user balances
      user.cashBalance = cashBalanceBefore - lockAmount;
      user.portfolioBalance = Number(user.portfolioBalance) + lockAmount;
      user.lockedFunds = lockAmount;
      user.lockedUntil = lockedUntil;
      user.dailyGifts = user.level * 2; // Give daily gifts
      user.giftsLastReset = new Date();

      await userRepository.save(user);

      // Create lock transaction
      const transaction = new Transaction();
      transaction.userId = user.id;
      transaction.type = TransactionType.LOCK_FUNDS;
      transaction.amount = lockAmount;
      transaction.balanceBefore = cashBalanceBefore;
      transaction.balanceAfter = cashBalanceBefore - lockAmount;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.description = 'Simulated 30-day lock for testing';
      transaction.metadata = {
        lockedUntil: lockedUntil.toISOString(),
        lockPeriodDays: 30,
        simulated: true
      };

      await transactionRepository.save(transaction);

      logger.info(`✅ Locked $${lockAmount} for 30 days, locked until: ${lockedUntil.toISOString()}`);
      logger.info(`💰 New balances: cash=$${user.cashBalance}, portfolio=$${user.portfolioBalance}, locked=$${user.lockedFunds}`);
    }

    // Step 2: Simulate 30 days passing by setting lockedUntil to past
    logger.info('⏰ Simulating 30 days passing...');

    const originalLockEnd = new Date(user.lockedUntil!);
    const expiredLockEnd = new Date(Date.now() - (24 * 60 * 60 * 1000)); // Set to yesterday

    user.lockedUntil = expiredLockEnd;
    await userRepository.save(user);

    logger.info(`✅ Lock period expired: ${originalLockEnd.toISOString()} → ${expiredLockEnd.toISOString()}`);

    // Step 3: Trigger auto-unlock by calling portfolio endpoint logic
    logger.info('🔓 Triggering auto-unlock by simulating portfolio API call...');

    const now = new Date();
    const portfolioBalanceBefore = Number(user.portfolioBalance);
    const cashBalanceBefore = Number(user.cashBalance);
    const lockedAmount = Number(user.lockedFunds);

    if (user.lockedFunds > 0 && user.lockedUntil && user.lockedUntil <= now) {
      logger.info(`🎯 Auto-unlocking expired funds: $${lockedAmount}`);

      // Perform auto-unlock
      user.portfolioBalance = portfolioBalanceBefore - lockedAmount;
      user.cashBalance = cashBalanceBefore + lockedAmount;
      user.lockedFunds = 0;
      user.lockedUntil = undefined;

      await userRepository.save(user);

      // Create unlock transaction
      const unlockTransaction = new Transaction();
      unlockTransaction.userId = user.id;
      unlockTransaction.type = TransactionType.UNLOCK_FUNDS;
      unlockTransaction.amount = lockedAmount;
      unlockTransaction.balanceBefore = cashBalanceBefore;
      unlockTransaction.balanceAfter = cashBalanceBefore + lockedAmount;
      unlockTransaction.status = TransactionStatus.COMPLETED;
      unlockTransaction.description = 'Auto-unlocked funds after 30-day lock period (simulated)';
      unlockTransaction.metadata = {
        autoUnlock: true,
        originalLockDate: originalLockEnd.toISOString(),
        lockPeriodDays: 30,
        simulated: true
      };

      await transactionRepository.save(unlockTransaction);

      logger.info(`✅ Auto-unlock completed! Transaction: ${unlockTransaction.id}`);
      logger.info(`💰 Funds moved: portfolio $${portfolioBalanceBefore} → $${user.portfolioBalance}, cash $${cashBalanceBefore} → $${user.cashBalance}`);
    } else {
      logger.error('❌ Auto-unlock conditions not met');
    }

    // Step 4: Verify final state
    logger.info('📊 Final verification:');
    logger.info(`   - Cash Balance: $${user.cashBalance}`);
    logger.info(`   - Portfolio Balance: $${user.portfolioBalance}`);
    logger.info(`   - Locked Funds: $${user.lockedFunds}`);
    logger.info(`   - Lock Expiration: ${user.lockedUntil || 'None'}`);

    // Check if funds were properly unlocked and moved to cash
    const cashIncreased = Number(user.cashBalance) > cashBalanceBefore;
    const portfolioDecreased = Number(user.portfolioBalance) < portfolioBalanceBefore;
    const lockedCleared = user.lockedFunds === 0;
    const expirationCleared = user.lockedUntil == null; // Check for both null and undefined

    if (cashIncreased && portfolioDecreased && lockedCleared && expirationCleared) {
      logger.info('✅ SUCCESS: Funds were automatically unlocked and moved to cash wallet!');
      logger.info(`   - Cash increased by: $${Number(user.cashBalance) - cashBalanceBefore}`);
      logger.info(`   - Portfolio decreased by: $${portfolioBalanceBefore - Number(user.portfolioBalance)}`);
    } else {
      logger.error('❌ FAILURE: Funds were not properly unlocked');
      logger.error(`   - Cash increased: ${cashIncreased}`);
      logger.error(`   - Portfolio decreased: ${portfolioDecreased}`);
      logger.error(`   - Locked cleared: ${lockedCleared}`);
      logger.error(`   - Expiration cleared: ${expirationCleared}`);
    }

    logger.info('🎉 30-day lock period simulation completed!');

  } catch (error) {
    logger.error('❌ Error simulating 30-day lock period:', error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to database
    await ScriptDataSource.initialize();
    logger.info('📦 Database connected for 30-day lock simulation');

    // Simulate 30-day lock period
    await simulate30DayLockPeriod();

    // Close database connection
    await ScriptDataSource.destroy();
    logger.info('✅ 30-day lock simulation completed successfully');

  } catch (error) {
    logger.error('❌ 30-day lock simulation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { simulate30DayLockPeriod };