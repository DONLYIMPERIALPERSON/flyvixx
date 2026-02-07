"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("../config/database");
const Notification_1 = require("../models/Notification");
const logger_1 = require("./logger");
class NotificationService {
    static async createNotification(userId, type, title, message, metadata) {
        try {
            const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
            const notification = new Notification_1.Notification();
            notification.userId = userId;
            notification.type = type;
            notification.title = title;
            notification.message = message;
            notification.metadata = metadata;
            const savedNotification = await notificationRepository.save(notification);
            logger_1.logger.info(`Notification created: ${type} for user ${userId}`);
            return savedNotification;
        }
        catch (error) {
            logger_1.logger.error('Failed to create notification:', error);
            throw error;
        }
    }
    static async createDepositNotification(userId, amount) {
        return await this.createNotification(userId, Notification_1.NotificationType.DEPOSIT, 'Deposit Received', `You have successfully received a deposit of $${amount.toFixed(2)}`, { amount });
    }
    static async createWithdrawalNotification(userId, amount) {
        return await this.createNotification(userId, Notification_1.NotificationType.WITHDRAWAL, 'Withdrawal Processed', `Your withdrawal of $${amount.toFixed(2)} has been processed successfully`, { amount });
    }
    static async createLockFundsNotification(userId, amount) {
        return await this.createNotification(userId, Notification_1.NotificationType.LOCK_FUNDS, 'Funds Locked', `You have successfully locked $${amount.toFixed(2)} in your portfolio for 30 days`, { amount, lockPeriodDays: 30 });
    }
    static async createUnlockFundsNotification(userId, amount) {
        return await this.createNotification(userId, Notification_1.NotificationType.UNLOCK_FUNDS, 'Funds Unlocked', `Your locked funds of $${amount.toFixed(2)} have been automatically unlocked and moved back to your cash balance`, { amount, autoUnlock: true });
    }
    static async createReferralNotification(userId, referrerEmail) {
        return await this.createNotification(userId, Notification_1.NotificationType.REFERRAL, 'New Referral', `${referrerEmail} has joined using your referral link`, { referrerEmail });
    }
    static async createSystemNotification(userId, title, message) {
        return await this.createNotification(userId, Notification_1.NotificationType.SYSTEM, title, message);
    }
    static async createRewardNotification(userId, title, message, rewardAmount) {
        return await this.createNotification(userId, Notification_1.NotificationType.REWARD, title, message, rewardAmount ? { rewardAmount } : undefined);
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map