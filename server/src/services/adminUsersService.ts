import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../models/User';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { logger } from '../utils/logger';

export interface UserInfo {
  id: string;
  email: string;
  cashBalance: number;
  lockedFunds: number;
  totalWealth: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalReferral: number;
  createdAt: string;
}

export interface UsersResponse {
  users: UserInfo[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export class AdminUsersService {
  // Get users with pagination and their financial data
  async getUsers(page: number = 1, limit: number = 10, searchEmail?: string): Promise<UsersResponse> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const transactionRepository = AppDataSource.getRepository(Transaction);

      // Build base query
      let queryBuilder = userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: UserStatus.ACTIVE })
        .orderBy('user.createdAt', 'DESC');

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

      // Execute query to get users
      const users = await queryBuilder.getMany();

      // Get user IDs for financial data queries
      const userIds = users.map(user => user.id);

      // Get financial data for all users in this page
      const financialData = await this.getUsersFinancialData(userIds);

      // Combine user data with financial data
      const usersInfo: UserInfo[] = users.map(user => {
        const finance = financialData[user.id] || {
          totalDeposit: 0,
          totalWithdrawal: 0,
          totalReferral: 0
        };

        return {
          id: user.id,
          email: user.email,
          cashBalance: parseFloat(user.cashBalance.toString()),
          lockedFunds: parseFloat(user.lockedFunds.toString()),
          totalWealth: parseFloat(user.cashBalance.toString()) + parseFloat(user.lockedFunds.toString()),
          totalDeposit: finance.totalDeposit,
          totalWithdrawal: finance.totalWithdrawal,
          totalReferral: finance.totalReferral,
          createdAt: user.createdAt.toISOString().slice(0, 19).replace('T', ' ')
        };
      });

      const totalPages = Math.ceil(totalCount / limit);

      logger.info(`Fetched ${usersInfo.length} users (page ${page}/${totalPages})`);

      return {
        users: usersInfo,
        totalCount,
        currentPage: page,
        totalPages
      };

    } catch (error) {
      logger.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get financial data for multiple users
  private async getUsersFinancialData(userIds: string[]): Promise<Record<string, {
    totalDeposit: number;
    totalWithdrawal: number;
    totalReferral: number;
  }>> {
    if (userIds.length === 0) return {};

    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get deposit sums
    const depositSums = await transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.userId', 'userId')
      .addSelect('SUM(transaction.amount)', 'totalDeposit')
      .where('transaction.userId IN (:...userIds)', { userIds })
      .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .groupBy('transaction.userId')
      .getRawMany();

    // Get withdrawal sums
    const withdrawalSums = await transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.userId', 'userId')
      .addSelect('SUM(transaction.amount)', 'totalWithdrawal')
      .where('transaction.userId IN (:...userIds)', { userIds })
      .andWhere('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
      .andWhere('transaction.status IN (:...statuses)', {
        statuses: [TransactionStatus.COMPLETED, TransactionStatus.APPROVED]
      })
      .groupBy('transaction.userId')
      .getRawMany();

    // For now, referral earnings are not implemented, so we'll set to 0
    // This can be updated when referral system is implemented
    const financialData: Record<string, any> = {};

    userIds.forEach(userId => {
      financialData[userId] = {
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalReferral: 0
      };
    });

    depositSums.forEach(sum => {
      if (financialData[sum.userId]) {
        financialData[sum.userId].totalDeposit = parseFloat(sum.totalDeposit || '0');
      }
    });

    withdrawalSums.forEach(sum => {
      if (financialData[sum.userId]) {
        financialData[sum.userId].totalWithdrawal = parseFloat(sum.totalWithdrawal || '0');
      }
    });

    return financialData;
  }

  // Get user details by ID
  async getUserById(userId: string): Promise<UserInfo | null> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const transactionRepository = AppDataSource.getRepository(Transaction);

      const user = await userRepository.findOne({
        where: { id: userId, status: UserStatus.ACTIVE }
      });

      if (!user) return null;

      // Get financial data
      const financialData = await this.getUsersFinancialData([userId]);
      const finance = financialData[userId] || {
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalReferral: 0
      };

      return {
        id: user.id,
        email: user.email,
        cashBalance: parseFloat(user.cashBalance.toString()),
        lockedFunds: parseFloat(user.lockedFunds.toString()),
        totalWealth: parseFloat(user.cashBalance.toString()) + parseFloat(user.lockedFunds.toString()),
        totalDeposit: finance.totalDeposit,
        totalWithdrawal: finance.totalWithdrawal,
        totalReferral: finance.totalReferral,
        createdAt: user.createdAt.toISOString().slice(0, 19).replace('T', ' ')
      };

    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      return null;
    }
  }
}

export const adminUsersService = new AdminUsersService();