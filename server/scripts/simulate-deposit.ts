import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../src/models/Transaction';
import { User } from '../src/models/User';
import { Game } from '../src/models/Game';
import { Bet } from '../src/models/Bet';
import { Notification } from '../src/models/Notification';
import { Admin } from '../src/models/Admin';
import { NotificationService } from '../src/utils/notificationService';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false, // Disable SSL for this script
  entities: [User, Game, Bet, Transaction, Notification, Admin],
  synchronize: false,
  logging: false,
});

async function simulateDeposit() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Find user by email
    const user = await userRepository.findOne({
      where: { email: 'dimperialperson@gmail.com' }
    });

    if (!user) {
      console.error('User not found with email: dimperialperson@gmail.com');
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Deposit amount in USD
    const depositAmountUSD = 1000;
    const currentBalance = Number(user.cashBalance);

    // Generate external reference
    const externalReference = `deposit_sim_${user.id}_${Date.now()}`;

    // Start transaction for atomicity
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Update user balance
      user.cashBalance = currentBalance + depositAmountUSD;
      await transactionalEntityManager.save(user);

      // Create transaction record
      const transaction = new Transaction();
      transaction.userId = user.id;
      transaction.type = TransactionType.DEPOSIT;
      transaction.amount = depositAmountUSD;
      transaction.balanceBefore = currentBalance;
      transaction.balanceAfter = currentBalance + depositAmountUSD;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.description = `Bank transfer deposit via SafeHaven (Simulated)`;
      transaction.externalId = externalReference;
      transaction.metadata = {
        method: 'bank_transfer',
        provider: 'safehaven',
        externalReference,
        simulated: true,
        exchangeRate: 1500,
        receivedAmountNGN: depositAmountUSD * 1500
      };

      await transactionalEntityManager.save(transaction);

      console.log(`✅ Deposit simulated successfully:`);
      console.log(`   User: ${user.email}`);
      console.log(`   Amount: $${depositAmountUSD}`);
      console.log(`   Previous Balance: $${currentBalance}`);
      console.log(`   New Balance: $${currentBalance + depositAmountUSD}`);
      console.log(`   Transaction ID: ${transaction.id}`);

      // Create deposit notification (skip email due to missing API key)
      try {
        const notification = await NotificationService.createDepositNotification(user.id, depositAmountUSD);
        console.log(`✅ Deposit notification created: ${notification.id}`);
      } catch (notificationError) {
        console.error('❌ Failed to create deposit notification:', notificationError);
      }

      console.log(`📧 Email notification skipped (API key not configured)`);
    });

    await AppDataSource.destroy();
    console.log('✅ Deposit simulation completed successfully');

  } catch (error) {
    console.error('❌ Error simulating deposit:', error);
    process.exit(1);
  }
}

simulateDeposit();