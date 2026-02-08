import { logger } from '../utils/logger';
import { emailService } from '../utils/emailService';
import { AppDataSource } from '../config/database';
import { Admin, AdminStatus } from '../models/Admin';

// In-memory storage for admin OTP codes (in production, use Redis or database)
const adminOtpStore = new Map<string, { code: string; expiresAt: Date; attempts: number; email: string }>();

// Generate a 6-digit OTP code
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export class AdminAuthService {
    // Check if admin exists in database
    async checkAdminExists(email: string): Promise<boolean> {
        try {
            const adminRepository = AppDataSource.getRepository(Admin);
            const admin = await adminRepository.findOne({
                where: { email, status: AdminStatus.ACTIVE }
            });
            return !!admin;
        } catch (error) {
            logger.error('Error checking admin existence:', error);
            return false;
        }
    }

    // Send OTP to admin email
    async sendOTP(email: string): Promise<{ success: boolean; error?: string; expiresIn?: number }> {
        try {
            if (!email || !email.includes('@flyvixx.com')) {
                return { success: false, error: 'Invalid email format. Must be @flyvixx.com domain.' };
            }

            logger.info(`Admin OTP request for email: ${email}`);

            const adminRepository = AppDataSource.getRepository(Admin);

            // Check if admin exists in database
            const admin = await adminRepository.findOne({ where: { email, status: AdminStatus.ACTIVE } });

            if (!admin) {
                logger.warn(`Admin OTP request denied - admin not found or inactive: ${email}`);
                return { success: false, error: 'Admin account not found or inactive.' };
            }

            // Check if there's an existing valid OTP
            const existingOtp = adminOtpStore.get(email);
            if (existingOtp && new Date() < existingOtp.expiresAt) {
                return {
                    success: false,
                    error: 'Please wait before requesting a new OTP',
                    expiresIn: Math.ceil((existingOtp.expiresAt.getTime() - Date.now()) / 1000)
                };
            }

            // Generate OTP
            const otpCode = generateOTP();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Store OTP
            adminOtpStore.set(email, {
                code: otpCode,
                expiresAt,
                attempts: 0,
                email
            });

            // Send OTP email
            const emailSent = await emailService.sendAdminOTPEmail(email, otpCode);

            if (!emailSent) {
                logger.error(`Failed to send admin OTP email to: ${email}`);
                return { success: false, error: 'Failed to send OTP email' };
            }

            logger.info(`Admin OTP sent successfully to: ${email}`);

            return {
                success: true,
                expiresIn: 300 // 5 minutes in seconds
            };
        } catch (error) {
            logger.error('Admin OTP send error:', error);
            return { success: false, error: 'Failed to send OTP' };
        }
    }

    // Verify admin OTP code
    async verifyOTP(email: string, code: string): Promise<{ success: boolean; error?: string; admin?: any; attemptsLeft?: number }> {
        try {
            if (!email || !code || typeof code !== 'string') {
                return { success: false, error: 'Email and OTP code are required' };
            }

            logger.info(`Admin OTP verification attempt for: ${email}`);

            const adminRepository = AppDataSource.getRepository(Admin);

            // Verify admin exists
            const admin = await adminRepository.findOne({ where: { email, status: AdminStatus.ACTIVE } });
            if (!admin) {
                return { success: false, error: 'Admin account not found or inactive.' };
            }

            const otpData = adminOtpStore.get(email);

            if (!otpData) {
                return { success: false, error: 'No OTP found. Please request a new one.' };
            }

            // Check if OTP has expired
            if (new Date() > otpData.expiresAt) {
                adminOtpStore.delete(email);
                return { success: false, error: 'OTP has expired. Please request a new one.' };
            }

            // Check attempts (max 3 attempts)
            if (otpData.attempts >= 3) {
                adminOtpStore.delete(email);
                return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
            }

            // Increment attempts
            otpData.attempts++;

            // Verify code
            if (code !== otpData.code) {
                adminOtpStore.set(email, otpData); // Update attempts
                return {
                    success: false,
                    error: 'Invalid OTP code',
                    attemptsLeft: 3 - otpData.attempts
                };
            }

            // OTP verified successfully
            adminOtpStore.delete(email); // Clean up used OTP

            // Update last login
            admin.lastLoginAt = new Date();
            await adminRepository.save(admin);

            logger.info(`Admin OTP verified successfully for: ${email}`);

            return {
                success: true,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    status: admin.status,
                    lastLoginAt: admin.lastLoginAt
                }
            };
        } catch (error) {
            logger.error('Admin OTP verify error:', error);
            return { success: false, error: 'Failed to verify OTP' };
        }
    }
}

export const adminAuthService = new AdminAuthService();