import express from 'express';
import { logger } from '../utils/logger';
import { emailService } from '../utils/emailService';
import { validateDescopeToken } from '../middleware/descopeAuth';

const router = express.Router();

// In-memory storage for OTP codes (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiresAt: Date; attempts: number }>();

// Generate a 6-digit OTP code
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/otp/send - Send OTP to user's email
router.post('/send', validateDescopeToken, async (req, res) => {
    try {
        const userId = (req as any).user?.sub;
        const userEmail = (req as any).user?.email;

        if (!userId || !userEmail) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP
        otpStore.set(userId, {
            code: otpCode,
            expiresAt,
            attempts: 0
        });

        // Send OTP email
        const emailSent = await emailService.sendOTPEmail(userEmail, otpCode);

        if (!emailSent) {
            logger.error(`Failed to send OTP email to user: ${userId}`);
            return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
        }

        logger.info(`OTP sent to user: ${userId}, email: ${userEmail}`);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        logger.error('OTP send error:', error);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

// POST /api/otp/verify - Verify OTP code
router.post('/verify', validateDescopeToken, async (req, res) => {
    try {
        const userId = (req as any).user?.sub;
        const { code } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ success: false, error: 'OTP code is required' });
        }

        const otpData = otpStore.get(userId);

        if (!otpData) {
            return res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
        }

        // Check if OTP has expired
        if (new Date() > otpData.expiresAt) {
            otpStore.delete(userId);
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
        }

        // Check attempts (max 3 attempts)
        if (otpData.attempts >= 3) {
            otpStore.delete(userId);
            return res.status(400).json({ success: false, error: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Increment attempts
        otpData.attempts++;

        // Verify code
        if (code !== otpData.code) {
            otpStore.set(userId, otpData); // Update attempts
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP code',
                attemptsLeft: 3 - otpData.attempts
            });
        }

        // OTP verified successfully
        otpStore.delete(userId); // Clean up used OTP

        logger.info(`OTP verified successfully for user: ${userId}`);

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        logger.error('OTP verify error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
});

// POST /api/otp/resend - Resend OTP (same as send, but checks if existing OTP is still valid)
router.post('/resend', validateDescopeToken, async (req, res) => {
    try {
        const userId = (req as any).user?.sub;
        const userEmail = (req as any).user?.email;

        if (!userId || !userEmail) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Check if there's an existing valid OTP
        const existingOtp = otpStore.get(userId);
        if (existingOtp && new Date() < existingOtp.expiresAt) {
            return res.status(400).json({
                success: false,
                error: 'Please wait before requesting a new OTP',
                timeLeft: Math.ceil((existingOtp.expiresAt.getTime() - Date.now()) / 1000)
            });
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP
        otpStore.set(userId, {
            code: otpCode,
            expiresAt,
            attempts: 0
        });

        // Send OTP email
        const emailSent = await emailService.sendOTPEmail(userEmail, otpCode);

        if (!emailSent) {
            logger.error(`Failed to resend OTP email to user: ${userId}`);
            return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
        }

        logger.info(`OTP resent to user: ${userId}, email: ${userEmail}`);

        res.json({
            success: true,
            message: 'OTP resent to your email',
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        logger.error('OTP resend error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend OTP' });
    }
});

export default router;