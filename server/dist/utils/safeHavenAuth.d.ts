declare class SafeHavenAuth {
    private accessToken;
    private tokenExpiry;
    /**
     * Generate a new JWT client assertion for SafeHaven OAuth2
     */
    private generateClientAssertion;
    /**
     * Get a valid access token, generating a new one if necessary
     */
    getAccessToken(): Promise<string>;
    /**
     * Make an authenticated request to SafeHaven API
     */
    makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<any>;
    /**
     * Verify bank account details
     */
    verifyBankAccount(bankCode: string, accountNumber: string): Promise<any>;
    /**
     * Create a virtual account for deposits
     */
    createVirtualAccount(amount: number, externalReference: string): Promise<any>;
    /**
     * Initiate a bank transfer
     */
    initiateTransfer(transferData: {
        nameEnquiryReference: string;
        debitAccountNumber: string;
        beneficiaryBankCode: string;
        beneficiaryAccountNumber: string;
        amount: number;
        saveBeneficiary: boolean;
        narration: string;
        paymentReference: string;
    }): Promise<any>;
    /**
     * Clear cached token (useful for testing or forced refresh)
     */
    clearToken(): void;
}
export declare const safeHavenAuth: SafeHavenAuth;
export default safeHavenAuth;
//# sourceMappingURL=safeHavenAuth.d.ts.map