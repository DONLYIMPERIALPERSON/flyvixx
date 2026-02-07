import { Notification, NotificationType } from '../models/Notification';
export declare class NotificationService {
    static createNotification(userId: string, type: NotificationType, title: string, message: string, metadata?: any): Promise<Notification>;
    static createDepositNotification(userId: string, amount: number): Promise<Notification>;
    static createWithdrawalNotification(userId: string, amount: number): Promise<Notification>;
    static createLockFundsNotification(userId: string, amount: number): Promise<Notification>;
    static createUnlockFundsNotification(userId: string, amount: number): Promise<Notification>;
    static createReferralNotification(userId: string, referrerEmail: string): Promise<Notification>;
    static createSystemNotification(userId: string, title: string, message: string): Promise<Notification>;
    static createRewardNotification(userId: string, title: string, message: string, rewardAmount?: number): Promise<Notification>;
}
//# sourceMappingURL=notificationService.d.ts.map