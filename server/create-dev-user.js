const { AppDataSource } = require('./dist/config/database');
const { User } = require('./dist/models/User');

async function createDevUser() {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    // Check if dev user exists
    let user = await userRepository.findOne({ where: { id: 'dev-user-123' } });

    if (!user) {
      user = new User();
      user.id = 'dev-user-123';
      user.email = 'ransomlucky234@gmail.com';
      user.username = 'dev_user';
      user.passwordHash = 'dev_managed';
      user.firstName = 'Dev';
      user.lastName = 'User';
      user.phoneNumber = '+1234567890';
      user.payoutDetails = {
        btc: { btcAddress: '1DevTestAddress123456789' },
        usdt: { usdtAddress: 'TDevTestAddress123456789' },
        bank: { accountName: 'Dev User', accountNumber: '1234567890', bankName: 'Dev Bank' }
      };

      await userRepository.save(user);
      console.log('✅ Dev user created successfully');
    } else {
      console.log('ℹ️  Dev user already exists');
    }

    console.log('User data:', JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDevUser();