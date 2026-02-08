import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  reconnectOnError: (err: Error) => {
    console.warn('Redis reconnect on error:', err.message);
    return err.message.includes('READONLY');
  }
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis ready to receive commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Closing Redis connection...');
  await redis.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Closing Redis connection...');
  await redis.quit();
  process.exit(0);
});

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  USER_BALANCE: 300,        // 5 minutes
  USER_PROFILE: 600,        // 10 minutes
  GAME_STATE: 30,          // 30 seconds
  LEADERBOARD: 300,        // 5 minutes
  MARKET_DATA: 60,         // 1 minute
  SESSION: 3600,           // 1 hour
  ADMIN_STATS: 180,        // 3 minutes
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  USER_BALANCE: 'user_balance:',
  USER_PROFILE: 'user_profile:',
  GAME_STATE: 'game_state:',
  LEADERBOARD: 'leaderboard:',
  MARKET_DATA: 'market_data:',
  SESSION: 'session:',
  ADMIN_STATS: 'admin_stats:',
} as const;

// Helper functions
export const getCacheKey = (prefix: string, id: string) => `${prefix}${id}`;

export const setCache = async (key: string, value: any, ttl?: number): Promise<void> => {
  try {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serializedValue);
    } else {
      await redis.set(key, serializedValue);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const clearCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis clear pattern error:', error);
  }
};

// Health check
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

export default redis;