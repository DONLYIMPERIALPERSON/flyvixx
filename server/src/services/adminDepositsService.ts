import { AppDataSource } from '../config/database';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export interface DepositRecord {
  id: string;
  userEmail: string;
  amount: number;
  dateTime: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface DepositsResponse {
  deposits: DepositRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export class AdminDepositsService {
  // Get deposits with pagination and search
  async getDeposits(
    page: number = 1,
    limit: number = 10,
    searchEmail?: string
  ): Promise<DepositsResponse> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      let queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.user', 'user')
        .where('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .orderBy('transaction.createdAt', 'DESC');

      // Add email search filter if provided
      if (searchEmail && searchEmail.trim()) {
        queryBuilder = queryBuilder.andWhere('user.email ILIKE :email', {
          email: `%${searchEmail.trim()}%`
        });
      }

      // Get total count for pagination
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(offset).take(limit);

      // Execute query
      const transactions = await queryBuilder.getMany();

      // Transform to deposit records
      const deposits: DepositRecord[] = transactions.map(transaction => ({
        id: transaction.id,
        userEmail: transaction.user.email,
        amount: parseFloat(transaction.amount.toString()),
        dateTime: transaction.createdAt.toISOString().slice(0, 19).replace('T', ' '),
        status: this.mapTransactionStatus(transaction.status)
      }));

      const totalPages = Math.ceil(totalCount / limit);

      logger.info(`Fetched ${deposits.length} deposits (page ${page}/${totalPages})`);

      return {
        deposits,
        totalCount,
        currentPage: page,
        totalPages
      };

    } catch (error) {
      logger.error('Error fetching deposits:', error);
      throw new Error('Failed to fetch deposits');
    }
  }

  // Map TransactionStatus to the simplified status used in frontend
  private mapTransactionStatus(status: TransactionStatus): 'completed' | 'pending' | 'failed' {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'completed';
      case TransactionStatus.PENDING:
      case TransactionStatus.PENDING_APPROVAL:
      case TransactionStatus.PROCESSING:
        return 'pending';
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
        return 'failed';
      default:
        return 'pending';
    }
  }
}

export const adminDepositsService = new AdminDepositsService();