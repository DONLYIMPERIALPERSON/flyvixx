import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../models/Notification';
import { logger } from './logger';

export class NotificationService {
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any
  ): Promise<Notification> {
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);

      const notification = new Notification();
      notification.userId = userId;
      notification.type = type;
      notification.title = title;
      notification.message = message;
      notification.metadata = metadata;

      const savedNotification = await notificationRepository.save(notification);

      logger.info(`Notification created: ${type} for user ${userId}`);
      return savedNotification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  static async createDepositNotification(userId: string, amount: number): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.DEPOSIT,
      'Deposit Received',
      `You have successfully received a deposit of $${amount.toFixed(2)}`,
      { amount }
    );
  }

  static async createWithdrawalNotification(userId: string, amount: number): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.WITHDRAWAL,
      'Withdrawal Processed',
      `Your withdrawal of $${amount.toFixed(2)} has been processed successfully`,
      { amount }
    );
  }

  static async createLockFundsNotification(userId: string, amount: number): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.LOCK_FUNDS,
      'Funds Locked',
      `You have successfully locked $${amount.toFixed(2)} in your portfolio for 30 days`,
      { amount, lockPeriodDays: 30 }
    );
  }

  static async createUnlockFundsNotification(userId: string, amount: number): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.UNLOCK_FUNDS,
      'Funds Unlocked',
      `Your locked funds of $${amount.toFixed(2)} have been automatically unlocked and moved back to your cash balance`,
      { amount, autoUnlock: true }
    );
  }

  static async createReferralNotification(userId: string, referrerEmail: string): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.REFERRAL,
      'New Referral',
      `${referrerEmail} has joined using your referral link`,
      { referrerEmail }
    );
  }

  static async createSystemNotification(userId: string, title: string, message: string): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.SYSTEM,
      title,
      message
    );
  }

  static async createRewardNotification(userId: string, title: string, message: string, rewardAmount?: number): Promise<Notification> {
    return await this.createNotification(
      userId,
      NotificationType.REWARD,
      title,
      message,
      rewardAmount ? { rewardAmount } : undefined
    );
  }
}