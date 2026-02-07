export interface EmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}
export declare class EmailService {
    private static instance;
    private templatesDir;
    private constructor();
    static getInstance(): EmailService;
    /**
     * Generate a random subject code to prevent email threading
     */
    private generateRandomSubjectCode;
    /**
     * Send an OTP email to a user
     */
    sendOTPEmail(email: string, otpCode: string): Promise<boolean>;
    /**
     * Send a deposit notification email to a user
     */
    sendDepositEmail(email: string, amount: string): Promise<boolean>;
    /**
     * Send a withdrawal notification email to a user
     */
    sendWithdrawalEmail(email: string, amount: string): Promise<boolean>;
    /**
     * Send a generic email
     */
    sendEmail(options: EmailOptions): Promise<boolean>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map