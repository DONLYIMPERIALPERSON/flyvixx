import { Bet } from './Bet';
import { Transaction } from './Transaction';
import { Notification } from './Notification';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    BANNED = "banned"
}
export declare class User {
    id: string;
    email: string;
    payoutDetails?: {
        btc?: {
            btcAddress?: string;
        };
        usdt?: {
            usdtAddress?: string;
        };
        bank?: {
            accountName?: string;
            accountNumber?: string;
            bankName?: string;
            nameEnquiryReference?: string;
        };
    };
    passwordHash: string;
    cashBalance: number;
    portfolioBalance: number;
    lockedFunds: number;
    lockedUntil?: Date;
    role: UserRole;
    status: UserStatus;
    lastLoginAt?: Date;
    emailVerified: boolean;
    referralCode?: string;
    referredBy?: string;
    createdAt: Date;
    updatedAt: Date;
    bets: Bet[];
    transactions: Transaction[];
    notifications: Notification[];
}
//# sourceMappingURL=User.d.ts.map