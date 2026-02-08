import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Transaction, TransactionStatus } from '../src/models/Transaction';
import { User } from '../src/models/User';
import { Game } from '../src/models/Game';
import { Bet } from '../src/models/Bet';
import { Notification } from '../src/models/Notification';
import { Admin } from '../src/models/Admin';
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

async function updateTransactionStatus() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Update the specific transaction to completed
    const result = await transactionRepository.update(
      { id: '230bc036-414a-40ce-8a85-423b12a59a7c' },
      { status: TransactionStatus.COMPLETED }
    );

    console.log(`Updated ${result.affected} transaction(s)`);

    // Verify the update
    const transaction = await transactionRepository.findOne({
      where: { id: '230bc036-414a-40ce-8a85-423b12a59a7c' }
    });

    if (transaction) {
      console.log(`Transaction status: ${transaction.status}`);
    }

    await AppDataSource.destroy();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error updating transaction:', error);
    process.exit(1);
  }
}

updateTransactionStatus();