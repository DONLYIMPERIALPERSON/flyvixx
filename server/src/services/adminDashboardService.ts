import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../models/User';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { logger } from '../utils/logger';

export interface DashboardMetrics {
  totalUsers: number;
  todayInvitedUsers: number;
  totalAutoPayout: number;
  totalAutoPayoutToday: number;
  totalDeposit: number;
  totalDepositToday: number;
  pendingPayout: number;
  totalAdminApprovedPayout: number;
  totalAdminWithdrawal: number;
  allTimeDebit: number;
  allTimeCredits: number;
  availableBalance: number;
  totalLockedFunds: number;
  totalUserCashBalance: number;
}

export class AdminDashboardService {
  // Get all dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const transactionRepository = AppDataSource.getRepository(Transaction);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 1. Total Users (All Time)
      const totalUsers = await userRepository.count({
        where: { status: UserStatus.ACTIVE }
      });

      // 2. Today Invited Users (users created today who were referred by someone)
      const todayInvitedUsers = await userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: UserStatus.ACTIVE })
        .andWhere('user.referredBy IS NOT NULL')
        .andWhere('user.createdAt >= :today', { today })
        .andWhere('user.createdAt < :tomorrow', { tomorrow })
        .getCount();

      // 3. Total Auto Payout (All Time) - completed withdrawals
      const totalAutoPayoutResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const totalAutoPayout = parseFloat(totalAutoPayoutResult?.total || '0');

      // 4. Total Auto Payout (Today)
      const totalAutoPayoutTodayResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere('transaction.createdAt >= :today', { today })
        .andWhere('transaction.createdAt < :tomorrow', { tomorrow })
        .getRawOne();

      const totalAutoPayoutToday = parseFloat(totalAutoPayoutTodayResult?.total || '0');

      // 5. Total Deposit (All Time)
      const totalDepositResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const totalDeposit = parseFloat(totalDepositResult?.total || '0');

      // 6. Total Deposit (Today)
      const totalDepositTodayResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .andWhere('transaction.createdAt >= :today', { today })
        .andWhere('transaction.createdAt < :tomorrow', { tomorrow })
        .getRawOne();

      const totalDepositToday = parseFloat(totalDepositTodayResult?.total || '0');

      // 7. Pending Payout - pending withdrawals
      const pendingPayoutResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
        .andWhere('transaction.status IN (:...statuses)', {
          statuses: [TransactionStatus.PENDING, TransactionStatus.PENDING_APPROVAL]
        })
        .getRawOne();

      const pendingPayout = parseFloat(pendingPayoutResult?.total || '0');

      // 8. Total Admin Approved Payout - approved withdrawals
      const totalAdminApprovedPayoutResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
        .andWhere('transaction.status = :status', { status: TransactionStatus.APPROVED })
        .getRawOne();

      const totalAdminApprovedPayout = parseFloat(totalAdminApprovedPayoutResult?.total || '0');

      // 9. Total Admin Withdrawal - admin cashouts from profit page
      const totalAdminWithdrawalResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :type', { type: TransactionType.ADMIN_CASHOUT })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const totalAdminWithdrawal = parseFloat(totalAdminWithdrawalResult?.total || '0');

      // 10. All Time Debit - total withdrawals (users + admin cashouts)
      const allTimeDebitResult = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type IN (:...types)', {
          types: [TransactionType.WITHDRAWAL, TransactionType.ADMIN_CASHOUT]
        })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const allTimeDebit = parseFloat(allTimeDebitResult?.total || '0');

      // 11. All Time Credits - same as total deposits (real finance only)
      const allTimeCredits = totalDeposit;

      // 12. Available Balance - calculate as credits minus debits
      const availableBalance = allTimeCredits - allTimeDebit;

      // 13. Total Locked Funds - sum of all users' locked funds
      const totalLockedFundsResult = await userRepository
        .createQueryBuilder('user')
        .select('SUM(user.lockedFunds)', 'total')
        .where('user.status = :status', { status: UserStatus.ACTIVE })
        .getRawOne();

      const totalLockedFunds = parseFloat(totalLockedFundsResult?.total || '0');

      // 14. Total User Cash Balance - sum of all users' cash balances
      const totalUserCashBalanceResult = await userRepository
        .createQueryBuilder('user')
        .select('SUM(user.cashBalance)', 'total')
        .where('user.status = :status', { status: UserStatus.ACTIVE })
        .getRawOne();

      const totalUserCashBalance = parseFloat(totalUserCashBalanceResult?.total || '0');

      logger.info('Dashboard metrics calculated successfully');

      return {
        totalUsers,
        todayInvitedUsers,
        totalAutoPayout,
        totalAutoPayoutToday,
        totalDeposit,
        totalDepositToday,
        pendingPayout,
        totalAdminApprovedPayout,
        totalAdminWithdrawal,
        allTimeDebit,
        allTimeCredits,
        availableBalance,
        totalLockedFunds,
        totalUserCashBalance
      };

    } catch (error) {
      logger.error('Error calculating dashboard metrics:', error);
      throw new Error('Failed to calculate dashboard metrics');
    }
  }
}

export const adminDashboardService = new AdminDashboardService();