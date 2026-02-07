"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const resend_1 = require("resend");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
class EmailService {
    constructor() {
        this.templatesDir = path.join(__dirname, '../templates/emails');
    }
    static getInstance() {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }
    /**
     * Generate a random subject code to prevent email threading
     */
    generateRandomSubjectCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * Send an OTP email to a user
     */
    async sendOTPEmail(email, otpCode) {
        try {
            // Load email templates
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'otp-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'otp-email.txt'), 'utf-8');
            // Replace placeholders
            const htmlContent = htmlTemplate.replace(/{{OTP_CODE}}/g, otpCode);
            const textContent = textTemplate.replace(/{{OTP_CODE}}/g, otpCode);
            // Use OTP code in subject to prevent email threading
            const subject = `Flyvixx OTP Code - ${otpCode}`;
            const result = await resend.emails.send({
                from: 'Flyvixx Security <security@mail.flyvixx.com>',
                to: [email],
                subject: subject,
                html: htmlContent,
                text: textContent,
            });
            console.log('📧 OTP email sent successfully:', result);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send OTP email:', error);
            return false;
        }
    }
    /**
     * Send a deposit notification email to a user
     */
    async sendDepositEmail(email, amount) {
        try {
            // Load email templates
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'deposit-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'deposit-email.txt'), 'utf-8');
            // Replace placeholders
            const htmlContent = htmlTemplate.replace(/\$10/g, `$${amount}`);
            const textContent = textTemplate.replace(/\$10/g, `$${amount}`);
            // Generate random number to prevent email threading
            const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const subject = `Flyvixx - Deposit Successful ${randomNumber}`;
            const result = await resend.emails.send({
                from: 'Flyvixx <noreply@mail.flyvixx.com>',
                to: [email],
                subject: subject,
                html: htmlContent,
                text: textContent,
            });
            console.log('📧 Deposit notification email sent successfully:', result);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send deposit notification email:', error);
            return false;
        }
    }
    /**
     * Send a withdrawal notification email to a user
     */
    async sendWithdrawalEmail(email, amount) {
        try {
            // Load email templates
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'withdrawal-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'withdrawal-email.txt'), 'utf-8');
            // Replace placeholders
            const htmlContent = htmlTemplate.replace(/\$20/g, `$${amount}`);
            const textContent = textTemplate.replace(/\$20/g, `$${amount}`);
            // Generate random number to prevent email threading
            const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const subject = `Flyvixx - Withdrawal Processed ${randomNumber}`;
            const result = await resend.emails.send({
                from: 'Flyvixx <noreply@mail.flyvixx.com>',
                to: [email],
                subject: subject,
                html: htmlContent,
                text: textContent,
            });
            console.log('📧 Withdrawal notification email sent successfully:', result);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send withdrawal notification email:', error);
            return false;
        }
    }
    /**
     * Send a generic email
     */
    async sendEmail(options) {
        try {
            const emailData = {
                from: 'Flyvixx <noreply@mail.flyvixx.com>',
                to: [options.to],
                subject: options.subject,
            };
            if (options.html) {
                emailData.html = options.html;
            }
            if (options.text) {
                emailData.text = options.text;
            }
            const result = await resend.emails.send(emailData);
            console.log('📧 Email sent successfully:', result);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
exports.emailService = EmailService.getInstance();
//# sourceMappingURL=emailService.js.map