import express from 'express';
import { logger } from '../utils/logger';
import { emailService } from '../utils/emailService';
import { AppDataSource } from '../config/database';
import { Admin, AdminStatus } from '../models/Admin';
import { Transaction, TransactionType } from '../models/Transaction';
import { adminDashboardService } from '../services/adminDashboardService';
import { adminDepositsService } from '../services/adminDepositsService';
import { adminWithdrawalsService } from '../services/adminWithdrawalsService';
import { adminProfitsService } from '../services/adminProfitsService';
import { adminUsersService } from '../services/adminUsersService';
import { adminAuthMiddleware, generateAdminToken } from '../middleware/adminAuth';

const router = express.Router();

// In-memory storage for admin OTP codes (in production, use Redis or database)
const adminOtpStore = new Map<string, { code: string; expiresAt: Date; attempts: number; email: string }>();

// Generate a 6-digit OTP code
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/admin/send-otp - Send OTP to admin email (only if admin exists in database)
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@flyvixx.com')) {
            return res.status(400).json({ success: false, error: 'Invalid email format. Must be @flyvixx.com domain.' });
        }

        logger.info(`Admin OTP request for email: ${email}`);

        const adminRepository = AppDataSource.getRepository(Admin);

        // Check if admin exists in database
        const admin = await adminRepository.findOne({ where: { email, status: AdminStatus.ACTIVE } });

        if (!admin) {
            logger.warn(`Admin OTP request denied - admin not found or inactive: ${email}`);
            return res.status(404).json({ success: false, error: 'Admin account not found or inactive.' });
        }

        // Check if there's an existing valid OTP
        const existingOtp = adminOtpStore.get(email);
        if (existingOtp && new Date() < existingOtp.expiresAt) {
            return res.status(400).json({
                success: false,
                error: 'Please wait before requesting a new OTP',
                timeLeft: Math.ceil((existingOtp.expiresAt.getTime() - Date.now()) / 1000)
            });
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
            return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
        }

        logger.info(`Admin OTP sent successfully to: ${email}`);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        logger.error('Admin OTP send error:', error);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

// POST /api/admin/verify-otp - Verify admin OTP code
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code || typeof code !== 'string') {
            return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
        }

        logger.info(`Admin OTP verification attempt for: ${email}`);

        const adminRepository = AppDataSource.getRepository(Admin);

        // Verify admin exists
        const admin = await adminRepository.findOne({ where: { email, status: AdminStatus.ACTIVE } });
        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin account not found or inactive.' });
        }

        const otpData = adminOtpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
        }

        // Check if OTP has expired
        if (new Date() > otpData.expiresAt) {
            adminOtpStore.delete(email);
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
        }

        // Check attempts (max 3 attempts)
        if (otpData.attempts >= 3) {
            adminOtpStore.delete(email);
            return res.status(400).json({ success: false, error: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Increment attempts
        otpData.attempts++;

        // Verify code
        if (code !== otpData.code) {
            adminOtpStore.set(email, otpData); // Update attempts
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP code',
                attemptsLeft: 3 - otpData.attempts
            });
        }

        // OTP verified successfully
        adminOtpStore.delete(email); // Clean up used OTP

        // Update last login
        admin.lastLoginAt = new Date();
        await adminRepository.save(admin);

        // Generate JWT token
        const token = generateAdminToken(admin);

        logger.info(`Admin OTP verified successfully for: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                status: admin.status,
                lastLoginAt: admin.lastLoginAt
            },
            token: token
        });
    } catch (error) {
        logger.error('Admin OTP verify error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
});

// POST /api/admin/logout - Admin logout
router.post('/logout', async (req, res) => {
    try {
        logger.info('Admin logout request');

        // For admin authentication, we don't need to do much server-side cleanup
        // The frontend will handle clearing localStorage

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Admin logout error:', error);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
});

// GET /api/admin/dashboard - Get dashboard metrics
router.get('/dashboard', adminAuthMiddleware, async (req, res) => {
    try {
        logger.info('Admin dashboard metrics request');

        const metrics = await adminDashboardService.getDashboardMetrics();

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        logger.error('Admin dashboard metrics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics' });
    }
});

// GET /api/admin/deposits - Get deposits with pagination and search
router.get('/deposits', adminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const searchEmail = req.query.email as string;

        logger.info(`Admin deposits request - page: ${page}, limit: ${limit}, search: ${searchEmail || 'none'}`);

        const result = await adminDepositsService.getDeposits(page, limit, searchEmail);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Admin deposits error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch deposits' });
    }
});

// POST /api/admin/deposits/:id/approve - Approve a deposit
router.post('/deposits/:id/approve', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, error: 'Deposit ID is required' });
        }

        // Get admin ID from authenticated admin
        const adminId = req.admin!.id;

        logger.info(`Admin deposit approval request: ${id} by ${req.admin!.email} (${adminId})`);

        const result = await adminDepositsService.approveDeposit(id, adminId);

        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch (error) {
        logger.error('Admin deposit approval error:', error);
        res.status(500).json({ success: false, error: 'Failed to approve deposit' });
    }
});

// POST /api/admin/deposits/:id/decline - Decline a deposit
router.post('/deposits/:id/decline', adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, error: 'Deposit ID is required' });
        }

        // Get admin ID from authenticated admin
        const adminId = req.admin!.id;

        logger.info(`Admin deposit decline request: ${id} by ${req.admin!.email} (${adminId})`);

        const result = await adminDepositsService.declineDeposit(id, adminId);

        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch (error) {
        logger.error('Admin deposit decline error:', error);
        res.status(500).json({ success: false, error: 'Failed to decline deposit' });
    }
});

// GET /api/admin/withdrawals - Get withdrawals with pagination and search
router.get('/withdrawals', adminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const searchEmail = req.query.email as string;

        logger.info(`Admin withdrawals request - page: ${page}, limit: ${limit}, search: ${searchEmail || 'none'}`);

        const result = await adminWithdrawalsService.getWithdrawals(page, limit, searchEmail);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Admin withdrawals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch withdrawals' });
    }
});

// GET /api/admin/withdrawals/:id - Get withdrawal details by ID
router.get('/withdrawals/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const transactionId = req.params.id;

    if (!transactionId) {
      return res.status(400).json({ success: false, error: 'Transaction ID is required' });
    }

    const transactionRepository = AppDataSource.getRepository(Transaction);
    const transaction = await transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user']
    });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Check if it's a withdrawal
    if (transaction.type !== TransactionType.WITHDRAWAL) {
      return res.status(400).json({ success: false, error: 'Transaction is not a withdrawal' });
    }

    // Get crypto address and type from metadata if it's a crypto withdrawal
    const metadata = transaction.metadata || {};
    const cryptoAddress = metadata.cryptoAddress;
    const cryptoType = metadata.method;

    res.json({
      success: true,
      cryptoAddress: cryptoAddress || null,
      cryptoType: cryptoType || null,
      transaction: {
        id: transaction.id,
        amount: Number(transaction.amount),
        method: metadata.method,
        status: transaction.status,
        userEmail: transaction.user.email
      }
    });
  } catch (error) {
    logger.error('Admin withdrawal details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch withdrawal details' });
  }
});

// POST /api/admin/withdrawals/approve - Approve a withdrawal
router.post('/withdrawals/approve', adminAuthMiddleware, async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ success: false, error: 'Transaction ID is required' });
        }

        // Get admin ID from authenticated admin
        const adminId = req.admin!.id;

        logger.info(`Admin withdrawal approval request: ${transactionId} by ${req.admin!.email} (${adminId})`);

        const result = await adminWithdrawalsService.approveWithdrawal(transactionId, adminId);

        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch (error) {
        logger.error('Admin withdrawal approval error:', error);
        res.status(500).json({ success: false, error: 'Failed to approve withdrawal' });
    }
});

// POST /api/admin/withdrawals/approve-crypto - Approve a crypto withdrawal
router.post('/withdrawals/approve-crypto', adminAuthMiddleware, async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ success: false, error: 'Transaction ID is required' });
        }

        // Get admin ID from authenticated admin
        const adminId = req.admin!.id;

        logger.info(`Admin crypto withdrawal approval request: ${transactionId} by ${req.admin!.email} (${adminId})`);

        const result = await adminWithdrawalsService.approveCryptoWithdrawal(transactionId, adminId);

        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch (error) {
        logger.error('Admin crypto withdrawal approval error:', error);
        res.status(500).json({ success: false, error: 'Failed to approve crypto withdrawal' });
    }
});

// GET /api/admin/profits/balance - Get available balance for admin cashout
router.get('/profits/balance', adminAuthMiddleware, async (req, res) => {
    try {
        logger.info('Admin profits balance request');

        const balanceInfo = await adminProfitsService.getAvailableBalance();

        res.json({
            success: true,
            data: balanceInfo
        });
    } catch (error) {
        logger.error('Admin profits balance error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch balance' });
    }
});

// POST /api/admin/profits/cashout - Process admin cashout
router.post('/profits/cashout', adminAuthMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Valid amount is required' });
        }

        // Get admin ID from authenticated admin
        const adminId = req.admin!.id;

        logger.info(`Admin cashout request: $${amount} by ${req.admin!.email} (${adminId})`);

        const result = await adminProfitsService.processCashout(amount, adminId);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                data: result.transaction
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch (error) {
        logger.error('Admin cashout error:', error);
        res.status(500).json({ success: false, error: 'Failed to process cashout' });
    }
});

// GET /api/admin/profits/history - Get cashout history
router.get('/profits/history', adminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        logger.info(`Admin cashout history request - page: ${page}, limit: ${limit}`);

        const result = await adminProfitsService.getCashoutHistory(page, limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Admin cashout history error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cashout history' });
    }
});

// GET /api/admin/users - Get users with pagination and search
router.get('/users', adminAuthMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const searchEmail = req.query.email as string;

        logger.info(`Admin users request - page: ${page}, limit: ${limit}, search: ${searchEmail || 'none'}`);

        const result = await adminUsersService.getUsers(page, limit, searchEmail);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Admin users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/:id - Get user details by ID
router.get('/users/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        logger.info(`Admin user details request for: ${userId}`);

        const user = await adminUsersService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Admin user details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user details' });
    }
});

export default router;
