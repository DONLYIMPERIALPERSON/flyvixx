import { User } from './User';
export declare enum NotificationType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    LOCK_FUNDS = "lock_funds",
    UNLOCK_FUNDS = "unlock_funds",
    REFERRAL = "referral",
    SYSTEM = "system",
    REWARD = "reward"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
    read: boolean;
    createdAt: Date;
    user: User;
}
//# sourceMappingURL=Notification.d.ts.map