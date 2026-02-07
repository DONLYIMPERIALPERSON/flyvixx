import { User } from './User';
export declare enum TransactionType {
    DEPOSIT = "deposit",
    WITHDRAWAL = "withdrawal",
    BET_PLACED = "bet_placed",
    CASH_OUT = "cash_out",
    TRANSFER = "transfer"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    PENDING_APPROVAL = "pending_approval",
    APPROVED = "approved",
    PROCESSING = "processing"
}
export declare class Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: TransactionStatus;
    description?: string;
    metadata?: any;
    externalId?: string;
    createdAt: Date;
    user: User;
}
//# sourceMappingURL=Transaction.d.ts.map