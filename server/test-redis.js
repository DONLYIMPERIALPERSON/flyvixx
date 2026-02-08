const Redis = require('ioredis');

// Test Redis connection
async function testRedis() {
  console.log('🔄 Testing Redis connection...');

  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  });

  try {
    // Test basic operations
    await redis.set('test_key', 'Hello Redis!');
    const value = await redis.get('test_key');
    console.log('✅ Redis GET/SET test:', value);

    // Test JSON storage
    const testData = { user: 'test', balance: 100.50 };
    await redis.set('test_user', JSON.stringify(testData));
    const storedData = JSON.parse(await redis.get('test_user'));
    console.log('✅ Redis JSON test:', storedData);

    // Test expiration
    await redis.setex('temp_key', 5, 'expires in 5 seconds');
    console.log('✅ Redis expiration test set');

    // Clean up
    await redis.del('test_key', 'test_user', 'temp_key');

    // Get info
    const info = await redis.info();
    const dbSize = await redis.dbsize();

    console.log('✅ Redis connection successful!');
    console.log(`📊 Database size: ${dbSize} keys`);
    console.log('📋 Redis Info:', info.split('\r\n').slice(0, 5).join('\n'));

  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
  } finally {
    await redis.quit();
  }
}

// Run test
testRedis().then(() => {
  console.log('🏁 Redis test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Redis test error:', error);
  process.exit(1);
});