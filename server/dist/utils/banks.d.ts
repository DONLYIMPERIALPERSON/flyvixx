export interface Bank {
    name: string;
    routingKey: string;
    bankCode: string;
    categoryId: string;
}
export declare const banks: Bank[];
export declare const sortedBanks: Bank[];
export declare function getBankCodeByName(bankName: string): string | null;
//# sourceMappingURL=banks.d.ts.map