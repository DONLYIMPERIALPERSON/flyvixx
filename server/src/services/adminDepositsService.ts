import { AppDataSource } from '../config/database';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { cachedUserService } from './cachedUserService';
import { emailService } from '../utils/emailService';

export interface DepositRecord {
  id: string;
  userEmail: string;
  amount: number;
  dateTime: string;
  status: 'completed' | 'pending' | 'failed';
  depositType?: 'btc' | 'usdt' | 'bank';
  cryptoAmount?: number;
  walletAddress?: string;
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
      const deposits: DepositRecord[] = transactions.map(transaction => {
        const metadata = transaction.metadata || {};
        return {
          id: transaction.id,
          userEmail: transaction.user.email,
          amount: parseFloat(transaction.amount.toString()),
          dateTime: transaction.createdAt.toISOString().slice(0, 19).replace('T', ' '),
          status: this.mapTransactionStatus(transaction.status),
          depositType: metadata.depositType,
          cryptoAmount: metadata.cryptoAmount ? parseFloat(metadata.cryptoAmount.toString()) : undefined,
          walletAddress: metadata.walletAddress
        };
      });

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

  // Approve a deposit transaction
  async approveDeposit(transactionId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const userRepository = AppDataSource.getRepository(User);

      // Find the transaction
      const transaction = await transactionRepository.findOne({
        where: { id: transactionId, type: TransactionType.DEPOSIT },
        relations: ['user']
      });

      if (!transaction) {
        return { success: false, message: 'Deposit transaction not found' };
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        return { success: false, message: 'Transaction is not in pending status' };
      }

      // Update transaction status
      transaction.status = TransactionStatus.COMPLETED;
      transaction.balanceBefore = Number(transaction.user.cashBalance);
      transaction.balanceAfter = Number(transaction.user.cashBalance) + Number(transaction.amount);

      // Update user balance
      transaction.user.cashBalance = Number(transaction.user.cashBalance) + Number(transaction.amount);

      // Save both transaction and user in a transaction
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(transaction);
        await transactionalEntityManager.save(transaction.user);
      });

      // Invalidate user cache after balance change
      await cachedUserService.invalidateUserCache(transaction.userId);

      // Send deposit success email for crypto deposits
      const metadata = transaction.metadata || {};
      if (metadata.depositType === 'btc' || metadata.depositType === 'usdt') {
        try {
          const amountValue = Number(transaction.amount);
          const emailSent = await emailService.sendDepositEmail(transaction.user.email, amountValue.toFixed(2));
          if (emailSent) {
            logger.info(`Deposit success email sent to ${transaction.user.email} for crypto deposit approval`);
          } else {
            logger.warn(`Deposit success email failed to send to ${transaction.user.email} for crypto deposit approval`);
          }
        } catch (emailError) {
          logger.error('Failed to send deposit success email for crypto deposit approval:', emailError);
          // Don't fail the approval if email fails, just log it
        }
      }

      logger.info(`Deposit approved: ${transactionId} by admin ${adminId}, amount: $${transaction.amount}`);

      return { success: true, message: 'Deposit approved successfully' };
    } catch (error) {
      logger.error('Error approving deposit:', error);
      return { success: false, message: 'Failed to approve deposit' };
    }
  }

  // Decline a deposit transaction
  async declineDeposit(transactionId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      // Find the transaction
      const transaction = await transactionRepository.findOne({
        where: { id: transactionId, type: TransactionType.DEPOSIT }
      });

      if (!transaction) {
        return { success: false, message: 'Deposit transaction not found' };
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        return { success: false, message: 'Transaction is not in pending status' };
      }

      // Update transaction status to failed
      transaction.status = TransactionStatus.FAILED;

      await transactionRepository.save(transaction);

      logger.info(`Deposit declined: ${transactionId} by admin ${adminId}, amount: $${transaction.amount}`);

      return { success: true, message: 'Deposit declined successfully' };
    } catch (error) {
      logger.error('Error declining deposit:', error);
      return { success: false, message: 'Failed to decline deposit' };
    }
  }
}

export const adminDepositsService = new AdminDepositsService();