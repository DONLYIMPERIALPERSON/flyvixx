import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create SMTP transporter for AWS SES
const createTransporter = () => {
  console.log('📧 Creating AWS SES SMTP transporter...');
  console.log('  Host:', process.env.AWS_SES_SMTP_HOST);
  console.log('  Port:', process.env.AWS_SES_SMTP_PORT);
  console.log('  Username:', process.env.AWS_SES_SMTP_USERNAME ? '***SET***' : 'NOT SET');

  return nodemailer.createTransport({
    host: process.env.AWS_SES_SMTP_HOST,
    port: parseInt(process.env.AWS_SES_SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.AWS_SES_SMTP_USERNAME,
      pass: process.env.AWS_SES_SMTP_PASSWORD,
    },
    // AWS SES requires TLS
    tls: {
      ciphers: 'SSLv3',
    },
  });
};

const transporter = createTransporter();

export interface EmailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

export class EmailService {
    private static instance: EmailService;
    private templatesDir: string;

    private constructor() {
        this.templatesDir = path.join(__dirname, '../templates/emails');
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    /**
     * Generate a random subject code to prevent email threading
     */
    private generateRandomSubjectCode(): string {
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
    public async sendOTPEmail(email: string, otpCode: string): Promise<boolean> {
        try {
            // Load email templates
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'otp-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'otp-email.txt'), 'utf-8');

            // Replace placeholders
            const htmlContent = htmlTemplate.replace(/{{OTP_CODE}}/g, otpCode);
            const textContent = textTemplate.replace(/{{OTP_CODE}}/g, otpCode);

            // Use OTP code in subject to prevent email threading
            const subject = `Flyvixx OTP Code - ${otpCode}`;

            const mailOptions = {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: email,
                subject: subject,
                html: htmlContent,
                text: textContent,
            };

            const result = await transporter.sendMail(mailOptions);

            console.log('📧 OTP email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send OTP email:', error);
            return false;
        }
    }

    /**
     * Send an OTP email to an admin
     */
    public async sendAdminOTPEmail(email: string, otpCode: string): Promise<boolean> {
        try {
            // Load email templates (use same OTP templates for now)
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'otp-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'otp-email.txt'), 'utf-8');

            // Replace placeholders
            const htmlContent = htmlTemplate.replace(/{{OTP_CODE}}/g, otpCode);
            const textContent = textTemplate.replace(/{{OTP_CODE}}/g, otpCode);

            // Admin-specific subject
            const subject = `Flyvixx Admin OTP Code - ${otpCode}`;

            const mailOptions = {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: email,
                subject: subject,
                html: htmlContent,
                text: textContent,
            };

            const result = await transporter.sendMail(mailOptions);

            console.log('📧 Admin OTP email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send admin OTP email:', error);
            return false;
        }
    }

    /**
     * Send a deposit notification email to a user
     */
    public async sendDepositEmail(email: string, amount: string): Promise<boolean> {
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

            const mailOptions = {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: email,
                subject: subject,
                html: htmlContent,
                text: textContent,
            };

            const result = await transporter.sendMail(mailOptions);

            console.log('📧 Deposit notification email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send deposit notification email:', error);
            return false;
        }
    }

    /**
     * Send a withdrawal notification email to a user
     */
    public async sendWithdrawalEmail(email: string, amount: string): Promise<boolean> {
        try {
            console.log('📧 Preparing to send withdrawal email to:', email, 'for amount:', amount);

            // Load email templates
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'withdrawal-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'withdrawal-email.txt'), 'utf-8');

            // Replace placeholders
            const htmlContent = htmlTemplate.replace(/\$20/g, `$${amount}`);
            const textContent = textTemplate.replace(/\$20/g, `$${amount}`);

            // Generate random number to prevent email threading
            const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const subject = `Flyvixx - Withdrawal Processed ${randomNumber}`;

            console.log('📧 Email data prepared:', {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: email,
                subject: subject,
                htmlLength: htmlContent.length,
                textLength: textContent.length
            });

            const mailOptions = {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: email,
                subject: subject,
                html: htmlContent,
                text: textContent,
            };

            const result = await transporter.sendMail(mailOptions);

            console.log('📧 Withdrawal notification email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send withdrawal notification email:', error);
            console.error('❌ Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                name: error instanceof Error ? error.name : 'Unknown',
                stack: error instanceof Error ? error.stack : undefined,
                fullError: error
            });
            return false;
        }
    }

    /**
     * Send a referral notification email to a referrer
     */
    public async sendReferralNotificationEmail(referrerEmail: string, newUserEmail: string): Promise<boolean> {
        try {
            // Load email templates
            const htmlTemplate = fs.readFileSync(path.join(this.templatesDir, 'referral-notification-email.html'), 'utf-8');
            const textTemplate = fs.readFileSync(path.join(this.templatesDir, 'referral-notification-email.txt'), 'utf-8');

            // Conceal the new user's email
            const concealEmail = (email: string) => {
                const [localPart, domain] = email.split('@');
                if (localPart.length <= 2) return `${localPart}***@${domain}`;
                return `${localPart.substring(0, 2)}***@${domain}`;
            };

            const concealedEmail = concealEmail(newUserEmail);

            // Replace placeholders
            const htmlContent = htmlTemplate
                .replace(/ranssom\*\*\*\*\*\*\*\*/g, concealedEmail)
                .replace(/Hi User/g, `Hi ${referrerEmail.split('@')[0]}`);

            const textContent = textTemplate
                .replace(/ranssom\*\*\*\*\*\*\*\*\*/g, concealedEmail)
                .replace(/Hi User/g, `Hi ${referrerEmail.split('@')[0]}`);

            // Generate random number to prevent email threading
            const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const subject = `Flyvixx - New Referral ${randomNumber}`;

            const mailOptions = {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: referrerEmail,
                subject: subject,
                html: htmlContent,
                text: textContent,
            };

            const result = await transporter.sendMail(mailOptions);

            console.log('📧 Referral notification email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send referral notification email:', error);
            return false;
        }
    }

    /**
     * Send a generic email
     */
    public async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions: any = {
                from: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
                to: options.to,
                subject: options.subject,
            };

            if (options.html) {
                mailOptions.html = options.html;
            }

            if (options.text) {
                mailOptions.text = options.text;
            }

            const result = await transporter.sendMail(mailOptions);

            console.log('📧 Email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }
}

export const emailService = EmailService.getInstance();