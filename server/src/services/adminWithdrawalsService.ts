import { AppDataSource } from '../config/database';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { User } from '../models/User';
import { Admin, AdminStatus } from '../models/Admin';
import { logger } from '../utils/logger';
import { safeHavenAuth } from '../utils/safeHavenAuth';
import { getBankCodeByName } from '../utils/banks';
import { emailService } from '../utils/emailService';
import { NotificationService } from '../utils/notificationService';

export interface WithdrawalRecord {
  id: string;
  email: string;
  amount: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalReferral: number;
  type: 'auto' | 'admin';
  state: 'processed_automatically' | 'waiting_for_admin_approval' | 'approved_by_admin';
  payoutDetails: string;
  dateTime: string;
  transactionId: string;
}

export interface WithdrawalsResponse {
  withdrawals: WithdrawalRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pendingCount: number;
}

export class AdminWithdrawalsService {
  // Get withdrawals with pagination and search
  async getWithdrawals(
    page: number = 1,
    limit: number = 10,
    searchEmail?: string
  ): Promise<WithdrawalsResponse> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      let queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.user', 'user')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
        .orderBy('transaction.createdAt', 'DESC');

      // Add email search filter if provided
      if (searchEmail && searchEmail.trim()) {
        queryBuilder = queryBuilder.andWhere('user.email ILIKE :email', {
          email: `%${searchEmail.trim()}%`
        });
      }

      // Get total count for pagination
      const totalCount = await queryBuilder.getCount();

      // Get count of pending approvals
      const pendingCount = await transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAWAL })
        .andWhere('transaction.status = :status', { status: TransactionStatus.PENDING_APPROVAL })
        .getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(offset).take(limit);

      // Execute query
      const transactions = await queryBuilder.getMany();

      // Get additional stats for each user
      const userIds = transactions.map(t => t.userId);
      const userStats = await this.getUserStats(userIds);

      // Transform to withdrawal records
      const withdrawals: WithdrawalRecord[] = transactions.map(transaction => {
        const userStat = userStats[transaction.userId];
        return {
          id: transaction.id,
          email: transaction.user.email,
          amount: parseFloat(transaction.amount.toString()),
          totalDeposit: userStat?.totalDeposit || 0,
          totalWithdrawal: userStat?.totalWithdrawal || 0,
          totalReferral: userStat?.totalReferral || 0,
          type: this.mapTransactionType(transaction),
          state: this.mapTransactionState(transaction.status, transaction),
          payoutDetails: this.formatPayoutDetails(transaction.user.payoutDetails),
          dateTime: transaction.createdAt.toISOString().slice(0, 19).replace('T', ' '),
          transactionId: transaction.id
        };
      });

      const totalPages = Math.ceil(totalCount / limit);

      logger.info(`Fetched ${withdrawals.length} withdrawals (page ${page}/${totalPages})`);

      return {
        withdrawals,
        totalCount,
        currentPage: page,
        totalPages,
        pendingCount
      };

    } catch (error) {
      logger.error('Error fetching withdrawals:', error);
      throw new Error('Failed to fetch withdrawals');
    }
  }

  // Get user statistics (total deposits, withdrawals, referrals)
  private async getUserStats(userIds: string[]): Promise<Record<string, {
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
        statuses: [TransactionStatus.COMPLETED, TransactionStatus.APPROVED, TransactionStatus.PENDING_APPROVAL]
      })
      .groupBy('transaction.userId')
      .getRawMany();

    // For now, referral earnings are not implemented, so we'll set to 0
    // This can be updated when referral system is implemented
    const stats: Record<string, any> = {};

    userIds.forEach(userId => {
      stats[userId] = {
        totalDeposit: 0,
        totalWithdrawal: 0,
        totalReferral: 0
      };
    });

    depositSums.forEach(sum => {
      if (stats[sum.userId]) {
        stats[sum.userId].totalDeposit = parseFloat(sum.totalDeposit || '0');
      }
    });

    withdrawalSums.forEach(sum => {
      if (stats[sum.userId]) {
        stats[sum.userId].totalWithdrawal = parseFloat(sum.totalWithdrawal || '0');
      }
    });

    return stats;
  }

  // Map TransactionStatus to withdrawal type
  private mapTransactionType(transaction: Transaction): 'auto' | 'admin' {
    // If it was auto-processed (completed without admin approval)
    if (transaction.status === TransactionStatus.COMPLETED &&
        !transaction.metadata?.requiresApproval) {
      return 'auto';
    }

    // If it required or received admin approval
    if (transaction.metadata?.requiresApproval ||
        transaction.status === TransactionStatus.APPROVED ||
        transaction.status === TransactionStatus.PENDING_APPROVAL) {
      return 'admin';
    }

    return 'auto'; // Default to auto
  }

  // Map TransactionStatus to withdrawal state
  private mapTransactionState(status: TransactionStatus, transaction?: Transaction):
    'processed_automatically' | 'waiting_for_admin_approval' | 'approved_by_admin' {

    switch (status) {
      case TransactionStatus.COMPLETED:
        // Check if it was admin-approved by looking for approval metadata
        if (transaction?.metadata?.approvedBy) {
          return 'approved_by_admin';
        }
        // Otherwise it was auto-processed
        return 'processed_automatically';

      case TransactionStatus.PENDING_APPROVAL:
        return 'waiting_for_admin_approval';

      case TransactionStatus.APPROVED:
        return 'approved_by_admin';

      case TransactionStatus.PENDING:
        // If approved and now being processed
        return 'approved_by_admin';

      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
        return 'processed_automatically'; // Default fallback

      default:
        return 'processed_automatically';
    }
  }

  // Format payout details for display
  private formatPayoutDetails(payoutDetails: any): string {
    if (!payoutDetails) return 'No payout details';

    if (payoutDetails.bank) {
      const { accountName, accountNumber, bankName } = payoutDetails.bank;
      return `Bank: ${bankName} - ****${accountNumber?.slice(-4)}`;
    }

    if (payoutDetails.btc) {
      return `BTC Wallet: ****${payoutDetails.btc.btcAddress?.slice(-4)}`;
    }

    if (payoutDetails.usdt) {
      return `USDT Wallet: ****${payoutDetails.usdt.usdtAddress?.slice(-4)}`;
    }

    return 'Unknown payout method';
  }

  // Approve a withdrawal
  async approveWithdrawal(transactionId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const adminRepository = AppDataSource.getRepository(Admin);

      // Get the transaction with user
      const transaction = await transactionRepository.findOne({
        where: { id: transactionId },
        relations: ['user']
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      if (transaction.status !== TransactionStatus.PENDING_APPROVAL) {
        return { success: false, message: 'Transaction is not pending approval' };
      }

      // Check if admin exists (since JWT middleware already validated the token, this is just a safety check)
      const admin = await adminRepository.findOne({
        where: { id: adminId, status: AdminStatus.ACTIVE }
      });
      if (!admin) {
        return { success: false, message: 'Admin access required' };
      }

      const withdrawalUser = transaction.user;

      // Get bank details from transaction metadata (stored during initial request)
      const beneficiaryBankCode = transaction.metadata?.beneficiaryBankCode;
      const beneficiaryAccountNumber = transaction.metadata?.beneficiaryAccountNumber;
      const amountNGN = transaction.metadata?.amountNGN;

      if (!beneficiaryBankCode || !beneficiaryAccountNumber || !amountNGN) {
        return { success: false, message: 'Bank details incomplete in transaction metadata' };
      }

      // Get settlement account
      const debitAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT;
      if (!debitAccountNumber) {
        return { success: false, message: 'Settlement account not configured' };
      }

      // Perform fresh name enquiry to get a valid sessionId
      let freshSessionId: string;
      try {
        logger.info(`Performing fresh name enquiry for admin withdrawal approval: bankCode=${beneficiaryBankCode}, accountNumber=${beneficiaryAccountNumber}`);
        const nameEnquiryResult = await safeHavenAuth.verifyBankAccount(beneficiaryBankCode, beneficiaryAccountNumber);

        if (nameEnquiryResult?.data?.sessionId) {
          freshSessionId = nameEnquiryResult.data.sessionId;
          logger.info(`Fresh name enquiry successful for admin approval, sessionId: ${freshSessionId}`);
        } else {
          logger.error('Fresh name enquiry failed for admin approval - no sessionId returned:', nameEnquiryResult);
          return { success: false, message: 'Failed to verify beneficiary account details' };
        }
      } catch (error) {
        logger.error('Fresh name enquiry error for admin approval:', error);
        return { success: false, message: 'Failed to verify beneficiary account details' };
      }

      // Generate payment reference for the approved withdrawal
      const paymentReference = `withdrawal_admin_approved_${transactionId}_${Date.now()}`;

      // Prepare transfer data
      const transferData = {
        nameEnquiryReference: freshSessionId,
        debitAccountNumber,
        beneficiaryBankCode,
        beneficiaryAccountNumber,
        amount: amountNGN, // Amount in NGN (already converted during initial request)
        saveBeneficiary: false,
        narration: `Admin Approved Withdrawal from FlyVixx - ${paymentReference}`,
        paymentReference
      };

      logger.info(`Admin approving withdrawal with transfer: ${JSON.stringify(transferData)}`);

      try {
        // Call SafeHaven transfer API
        const transferResult = await safeHavenAuth.initiateTransfer(transferData);
        logger.info(`SafeHaven transfer result for admin approval: ${JSON.stringify(transferResult, null, 2)}`);

        // Check if SafeHaven transfer was successful
        const isTransferSuccessful = transferResult?.statusCode === 200 &&
                                   transferResult?.responseCode === '00' &&
                                   transferResult?.data?.status === 'Completed';

        if (isTransferSuccessful) {
          // Update transaction status to COMPLETED (matching auto withdrawal logic)
          transaction.status = TransactionStatus.COMPLETED;
          transaction.externalId = paymentReference;
          transaction.description = `Bank withdrawal via SafeHaven (Admin Approved)`;
          transaction.metadata = {
            ...transaction.metadata,
            transferReference: transferResult.data?.reference,
            approvedBy: adminId,
            approvedAt: new Date().toISOString(),
            transferInitiatedAt: new Date().toISOString()
          };

          await transactionRepository.save(transaction);

          logger.info(`Admin withdrawal approved and completed: Transaction ${transactionId}`);

          // Send withdrawal notification email to user
          try {
            const amountValue = Number(transaction.amount);
            const emailSent = await emailService.sendWithdrawalEmail(withdrawalUser.email, amountValue.toFixed(2));
            if (emailSent) {
              logger.info(`Withdrawal notification email sent to ${withdrawalUser.email} for admin approved withdrawal`);
            } else {
              logger.warn(`Withdrawal notification email failed to send to ${withdrawalUser.email} for admin approved withdrawal - service returned false`);
            }
          } catch (emailError) {
            logger.error('Failed to send withdrawal notification email for admin approved withdrawal:', emailError);
            // Don't fail the approval if email fails
          }

          // Create withdrawal notification
          try {
            const amountValue = Number(transaction.amount);
            const notification = await NotificationService.createWithdrawalNotification(withdrawalUser.id, amountValue);
            logger.info(`✅ Withdrawal notification created for user ${withdrawalUser.id}: ${notification.id}`);
          } catch (notificationError) {
            logger.error('❌ Failed to create withdrawal notification:', notificationError);
            // Don't fail the withdrawal if notification creation fails
          }

          return {
            success: true,
            message: 'Withdrawal approved and completed successfully'
          };

        } else {
          // Transfer failed - mark as failed for retry
          transaction.status = TransactionStatus.FAILED;
          transaction.metadata = {
            ...transaction.metadata,
            transferError: transferResult?.error || 'Transfer failed',
            adminRetryAvailable: true,
            approvedBy: adminId,
            approvedAt: new Date().toISOString(),
            transferAttemptedAt: new Date().toISOString()
          };

          await transactionRepository.save(transaction);

          logger.error(`Admin approved withdrawal transfer failed: Transaction ${transactionId}`);

          return {
            success: false,
            message: 'Withdrawal approval failed - transfer could not be initiated. Marked for admin retry.'
          };
        }
      } catch (error) {
        // Handle transfer error
        transaction.status = TransactionStatus.FAILED;
        transaction.metadata = {
          ...transaction.metadata,
          transferError: error instanceof Error ? error.message : 'Unknown transfer error',
          adminRetryAvailable: true,
          approvedBy: adminId,
          approvedAt: new Date().toISOString(),
          transferAttemptedAt: new Date().toISOString()
        };

        await transactionRepository.save(transaction);

        logger.error(`Admin approved withdrawal transfer error: Transaction ${transactionId}`, error);

        return {
          success: false,
          message: 'Withdrawal approval encountered an error during transfer. Marked for admin retry.'
        };
      }

    } catch (error) {
      logger.error('Error approving withdrawal:', error);
      return { success: false, message: 'Failed to approve withdrawal' };
    }
  }
}

export const adminWithdrawalsService = new AdminWithdrawalsService();