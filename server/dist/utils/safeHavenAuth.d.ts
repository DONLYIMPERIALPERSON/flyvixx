declare class SafeHavenAuth {
    private accessToken;
    private tokenExpiry;
    private generateClientAssertion;
    getAccessToken(): Promise<string>;
    makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<any>;
    verifyBankAccount(bankCode: string, accountNumber: string): Promise<any>;
    createVirtualAccount(amount: number, externalReference: string): Promise<any>;
    initiateTransfer(transferData: any): Promise<any>;
    clearToken(): void;
}
export declare const safeHavenAuth: SafeHavenAuth;
export default safeHavenAuth;
//# sourceMappingURL=safeHavenAuth.d.ts.map