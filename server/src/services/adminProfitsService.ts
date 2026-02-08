import { AppDataSource } from '../config/database';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { Admin, AdminStatus } from '../models/Admin';
import { safeHavenAuth } from '../utils/safeHavenAuth';
import { getBankCodeByName } from '../utils/banks';
import { logger } from '../utils/logger';

export interface AdminCashoutResult {
  success: boolean;
  message: string;
  transaction?: {
    id: string;
    amount: number;
    admin1Amount: number;
    admin2Amount: number;
    admin1TransactionId: string;
    admin2TransactionId: string;
  };
}

export interface AdminBalanceInfo {
  availableBalance: number;
  totalProfits: number;
  lastCashout?: {
    amount: number;
    date: string;
  };
}

export class AdminProfitsService {
  // Get available balance for admin cashout
  async getAvailableBalance(): Promise<AdminBalanceInfo> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      // Calculate total platform profits
      // This includes all completed bets (user losses) minus withdrawals and deposits
      // For simplicity, we'll calculate based on transaction types

      // Get total deposits (money coming into platform)
      const totalDeposits = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :depositType', { depositType: TransactionType.DEPOSIT })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      // Get total withdrawals (money going out to users)
      const totalWithdrawals = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :withdrawalType', { withdrawalType: TransactionType.WITHDRAWAL })
        .andWhere('transaction.status IN (:...statuses)', {
          statuses: [TransactionStatus.COMPLETED, TransactionStatus.APPROVED]
        })
        .getRawOne();

      // Get total admin cashouts (money going out to admins)
      const totalAdminCashouts = await transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.type = :cashoutType', { cashoutType: TransactionType.ADMIN_CASHOUT })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const deposits = parseFloat(totalDeposits?.total || '0');
      const withdrawals = parseFloat(totalWithdrawals?.total || '0');
      const adminCashouts = parseFloat(totalAdminCashouts?.total || '0');

      // Available balance = deposits - withdrawals - admin cashouts
      const availableBalance = Math.max(0, deposits - withdrawals - adminCashouts);

      // Get last cashout
      const lastCashout = await transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.type = :cashoutType', { cashoutType: TransactionType.ADMIN_CASHOUT })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .orderBy('transaction.createdAt', 'DESC')
        .limit(1)
        .getOne();

      const balanceInfo: AdminBalanceInfo = {
        availableBalance,
        totalProfits: deposits - withdrawals
      };

      if (lastCashout) {
        balanceInfo.lastCashout = {
          amount: parseFloat(lastCashout.amount.toString()),
          date: lastCashout.createdAt.toISOString().slice(0, 19).replace('T', ' ')
        };
      }

      logger.info(`Admin balance calculated: $${availableBalance} available`);

      return balanceInfo;

    } catch (error) {
      logger.error('Error calculating admin balance:', error);
      throw new Error('Failed to calculate available balance');
    }
  }

  // Process admin cashout with 50/50 split
  async processCashout(amount: number, adminId: string): Promise<AdminCashoutResult> {
    try {
      // Validate amount
      if (amount <= 0) {
        return { success: false, message: 'Invalid cashout amount' };
      }

      // Check available balance
      const balanceInfo = await this.getAvailableBalance();
      if (amount > balanceInfo.availableBalance) {
        return { success: false, message: 'Insufficient available balance' };
      }

      // Get admin details
      const adminRepository = AppDataSource.getRepository(Admin);
      const admin = await adminRepository.findOne({ where: { id: adminId } });

      if (!admin) {
        return { success: false, message: 'Admin not found' };
      }

      // Check if admin has payout details configured
      if (!admin.payoutDetails?.bank?.accountName ||
          !admin.payoutDetails?.bank?.accountNumber ||
          !admin.payoutDetails?.bank?.bankName) {
        return { success: false, message: 'Admin payout details not configured' };
      }

      // Calculate 50/50 split
      const admin1Amount = amount * 0.5;
      const admin2Amount = amount * 0.5;

      // Get admin 2 details
      const admin2 = await adminRepository.findOne({
        where: { email: 'sopsman@flyvixx.com', status: AdminStatus.ACTIVE }
      });

      if (!admin2 || !admin2.payoutDetails?.bank) {
        return { success: false, message: 'Admin 2 payout details not configured' };
      }

      const admin2Details = admin2.payoutDetails.bank;

      // Process payments using SafeHaven
      const admin1TransactionId = await this.processAdminPayment(admin1Amount, admin.payoutDetails.bank, 'Admin 1');
      const admin2TransactionId = await this.processAdminPayment(admin2Amount, admin2Details, 'Admin 2');

      // Record the cashout transaction
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const cashoutTransaction = new Transaction();
      cashoutTransaction.userId = 'system_admin_cashouts'; // Use system user for admin cashouts
      cashoutTransaction.type = TransactionType.ADMIN_CASHOUT;
      cashoutTransaction.amount = amount;
      cashoutTransaction.balanceBefore = balanceInfo.availableBalance;
      cashoutTransaction.balanceAfter = balanceInfo.availableBalance - amount;
      cashoutTransaction.status = TransactionStatus.COMPLETED;
      cashoutTransaction.description = `Admin cashout - 50/50 split`;
      cashoutTransaction.externalId = `admin_cashout_${Date.now()}`;
      cashoutTransaction.metadata = {
        admin1Amount,
        admin2Amount,
        admin1TransactionId,
        admin2TransactionId,
        split: '50/50',
        processedBy: adminId
      };

      await transactionRepository.save(cashoutTransaction);

      logger.info(`Admin cashout processed: $${amount} split 50/50 between admins`);

      return {
        success: true,
        message: 'Cashout processed successfully',
        transaction: {
          id: cashoutTransaction.id,
          amount,
          admin1Amount,
          admin2Amount,
          admin1TransactionId,
          admin2TransactionId
        }
      };

    } catch (error) {
      logger.error('Error processing admin cashout:', error);
      return { success: false, message: 'Failed to process cashout' };
    }
  }

  // Process payment to individual admin using SafeHaven
  private async processAdminPayment(amount: number, bankDetails: any, adminLabel: string): Promise<string> {
    try {
      // Convert USD to NGN for SafeHaven
      const WITHDRAWAL_RATE = 1450; // Same rate as user withdrawals
      const amountNGN = amount * WITHDRAWAL_RATE;

      // Get bank code
      const beneficiaryBankCode = getBankCodeByName(bankDetails.bankName);
      if (!beneficiaryBankCode) {
        throw new Error(`Invalid bank name for ${adminLabel}: ${bankDetails.bankName}`);
      }

      // Perform fresh name enquiry
      let sessionId: string;
      try {
        const nameEnquiryResult = await safeHavenAuth.verifyBankAccount(beneficiaryBankCode, bankDetails.accountNumber);
        if (nameEnquiryResult?.data?.sessionId) {
          sessionId = nameEnquiryResult.data.sessionId;
        } else {
          throw new Error(`Name enquiry failed for ${adminLabel}`);
        }
      } catch (error) {
        logger.error(`Name enquiry error for ${adminLabel}:`, error);
        throw new Error(`Failed to verify ${adminLabel} account details`);
      }

      // Get settlement account
      const debitAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT;
      if (!debitAccountNumber) {
        throw new Error('Settlement account not configured');
      }

      // Prepare transfer data
      const transferData = {
        nameEnquiryReference: sessionId,
        debitAccountNumber,
        beneficiaryBankCode,
        beneficiaryAccountNumber: bankDetails.accountNumber,
        amount: amountNGN,
        saveBeneficiary: false,
        narration: `Admin Cashout - ${adminLabel} - FlyVixx Platform`,
        paymentReference: `admin_cashout_${adminLabel.toLowerCase()}_${Date.now()}`
      };

      // Initiate transfer
      const transferResult = await safeHavenAuth.initiateTransfer(transferData);

      if (transferResult?.statusCode === 200 && transferResult?.responseCode === '00') {
        logger.info(`${adminLabel} payment initiated: $${amount} (${amountNGN} NGN)`);
        return transferResult.data?.reference || transferData.paymentReference;
      } else {
        throw new Error(`Transfer failed for ${adminLabel}: ${transferResult?.error || 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`Error processing ${adminLabel} payment:`, error);
      throw error;
    }
  }

  // Get cashout history
  async getCashoutHistory(page: number = 1, limit: number = 10): Promise<{
    cashouts: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const transactionRepository = AppDataSource.getRepository(Transaction);

      const queryBuilder = transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.user', 'admin')
        .where('transaction.type = :type', { type: TransactionType.ADMIN_CASHOUT })
        .orderBy('transaction.createdAt', 'DESC');

      // Get total count
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      // Execute query
      const transactions = await queryBuilder.getMany();

      // Transform to cashout records
      const cashouts = transactions.map(transaction => ({
        id: transaction.id,
        amount: parseFloat(transaction.amount.toString()),
        admin1Amount: transaction.metadata?.admin1Amount || transaction.amount * 0.5,
        admin2Amount: transaction.metadata?.admin2Amount || transaction.amount * 0.5,
        date: transaction.createdAt.toISOString().slice(0, 19).replace('T', ' '),
        status: transaction.status,
        processedBy: transaction.user?.email || 'Unknown'
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        cashouts,
        totalCount,
        currentPage: page,
        totalPages
      };

    } catch (error) {
      logger.error('Error fetching cashout history:', error);
      throw new Error('Failed to fetch cashout history');
    }
  }
}

export const adminProfitsService = new AdminProfitsService();