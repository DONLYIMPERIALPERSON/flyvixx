import { Bet } from './Bet';
import { Transaction } from './Transaction';
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
    role: UserRole;
    status: UserStatus;
    lastLoginAt?: Date;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    bets: Bet[];
    transactions: Transaction[];
}
//# sourceMappingURL=User.d.ts.map