import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { redis, CACHE_KEYS, CACHE_TTL, getCacheKey, setCache, getCache, deleteCache } from '../config/redis';
import { logger } from '../utils/logger';

export interface UserBalance {
  cashBalance: number;
  portfolioBalance: number;
  lockedFunds: number;
  totalBalance: number;
}

export interface CachedUserProfile {
  id: string;
  email: string;
  cashBalance: number;
  portfolioBalance: number;
  lockedFunds: number;
  totalBalance: number;
  level: number;
  referralCode?: string;
  emailVerified: boolean;
  lastLoginAt?: Date;
}

export class CachedUserService {
  // Get cached user balance with fallback to database
  async getUserBalance(userId: string): Promise<UserBalance> {
    const cacheKey = getCacheKey(CACHE_KEYS.USER_BALANCE, userId);

    try {
      // Try to get from cache first
      const cachedBalance = await getCache<UserBalance>(cacheKey);
      if (cachedBalance) {
        logger.debug(`Cache hit for user balance: ${userId}`);
        return cachedBalance;
      }

      // Cache miss - calculate from database
      logger.debug(`Cache miss for user balance: ${userId}`);
      const balance = await this.calculateUserBalance(userId);

      // Cache the result
      await setCache(cacheKey, balance, CACHE_TTL.USER_BALANCE);

      return balance;
    } catch (error) {
      logger.error('Error getting cached user balance:', error);
      // Fallback to direct calculation
      return this.calculateUserBalance(userId);
    }
  }

  // Calculate user balance from database (expensive operation)
  private async calculateUserBalance(userId: string): Promise<UserBalance> {
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user base balance
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      select: ['cashBalance', 'portfolioBalance', 'lockedFunds']
    });

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`🔍 Calculating balance for user ${userId}: base cash=${user.cashBalance}, portfolio=${user.portfolioBalance}`);

    // Calculate actual cash balance from transactions
    const cashTransactions = await transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type IN (:...types)', {
        types: [TransactionType.DEPOSIT, TransactionType.WITHDRAWAL, TransactionType.CASH_OUT, TransactionType.TRANSFER]
      })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .getRawOne();

    const transactionBalance = parseFloat(cashTransactions?.total || '0');
    logger.info(`💰 Cash transactions total: ${transactionBalance}`);

    // Calculate portfolio balance from bets
    const portfolioTransactions = await transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type IN (:...types)', {
        types: [TransactionType.BET_PLACED, TransactionType.LOCK_FUNDS, TransactionType.UNLOCK_FUNDS]
      })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .getRawOne();

    const portfolioBalance = parseFloat(portfolioTransactions?.total || '0');
    logger.info(`📊 Portfolio transactions total: ${portfolioBalance}`);

    const finalCashBalance = user.cashBalance + transactionBalance;
    const finalPortfolioBalance = user.portfolioBalance + portfolioBalance;

    logger.info(`✅ Final balance for user ${userId}: cash=${finalCashBalance}, portfolio=${finalPortfolioBalance}`);

    const balance: UserBalance = {
      cashBalance: finalCashBalance,
      portfolioBalance: finalPortfolioBalance,
      lockedFunds: user.lockedFunds,
      totalBalance: finalCashBalance + finalPortfolioBalance
    };

    return balance;
  }

  // Get cached user profile
  async getUserProfile(userId: string): Promise<CachedUserProfile | null> {
    const cacheKey = getCacheKey(CACHE_KEYS.USER_PROFILE, userId);

    try {
      // Try cache first
      const cachedProfile = await getCache<CachedUserProfile>(cacheKey);
      if (cachedProfile) {
        logger.debug(`Cache hit for user profile: ${userId}`);
        return cachedProfile;
      }

      // Cache miss - get from database
      logger.debug(`Cache miss for user profile: ${userId}`);
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: userId },
        select: [
          'id', 'email', 'cashBalance', 'portfolioBalance', 'lockedFunds',
          'level', 'referralCode', 'emailVerified', 'lastLoginAt'
        ]
      });

      if (!user) return null;

      // Get current balance
      const balance = await this.getUserBalance(userId);

      const profile: CachedUserProfile = {
        id: user.id,
        email: user.email,
        cashBalance: balance.cashBalance,
        portfolioBalance: balance.portfolioBalance,
        lockedFunds: balance.lockedFunds,
        totalBalance: balance.totalBalance,
        level: user.level,
        referralCode: user.referralCode || undefined,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt || undefined
      };

      // Cache the profile
      await setCache(cacheKey, profile, CACHE_TTL.USER_PROFILE);

      return profile;
    } catch (error) {
      logger.error('Error getting cached user profile:', error);
      return null;
    }
  }

  // Invalidate user caches when balance changes
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const balanceKey = getCacheKey(CACHE_KEYS.USER_BALANCE, userId);
      const profileKey = getCacheKey(CACHE_KEYS.USER_PROFILE, userId);

      await Promise.all([
        deleteCache(balanceKey),
        deleteCache(profileKey)
      ]);

      logger.debug(`Invalidated cache for user: ${userId}`);
    } catch (error) {
      logger.error('Error invalidating user cache:', error);
    }
  }

  // Update user balance and invalidate cache
  async updateUserBalance(userId: string, updates: Partial<UserBalance>): Promise<void> {
    try {
      // Update database
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update(userId, {
        cashBalance: updates.cashBalance,
        portfolioBalance: updates.portfolioBalance,
        lockedFunds: updates.lockedFunds
      });

      // Invalidate cache
      await this.invalidateUserCache(userId);

      logger.info(`Updated balance for user ${userId}:`, updates);
    } catch (error) {
      logger.error('Error updating user balance:', error);
      throw error;
    }
  }

  // Batch invalidate multiple users (useful for admin operations)
  async invalidateMultipleUsers(userIds: string[]): Promise<void> {
    try {
      const cacheKeys = userIds.flatMap(userId => [
        getCacheKey(CACHE_KEYS.USER_BALANCE, userId),
        getCacheKey(CACHE_KEYS.USER_PROFILE, userId)
      ]);

      if (cacheKeys.length > 0) {
        await redis.del(...cacheKeys);
      }

      logger.debug(`Invalidated cache for ${userIds.length} users`);
    } catch (error) {
      logger.error('Error invalidating multiple user caches:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    connected: boolean;
    dbSize: number;
    info: any;
  }> {
    try {
      const [connected, dbSize, info] = await Promise.all([
        redis.ping().then(() => true).catch(() => false),
        redis.dbsize(),
        redis.info()
      ]);

      return {
        connected,
        dbSize,
        info: this.parseRedisInfo(info)
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        connected: false,
        dbSize: 0,
        info: null
      };
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const parsed: any = {};

    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    });

    return parsed;
  }
}

export const cachedUserService = new CachedUserService();