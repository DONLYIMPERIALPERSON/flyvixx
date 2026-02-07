"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const descopeAuth_1 = require("../middleware/descopeAuth");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const emailService_1 = require("../utils/emailService");
const notificationService_1 = require("../utils/notificationService");
const router = express_1.default.Router();
// POST /api/auth/verify - Verify Descope token and get/create user in database
router.post('/verify', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const descopeUser = req.user;
        const { referralCode } = req.body; // Check for referral code in request body
        if (!descopeUser?.sub) {
            return res.status(400).json({ success: false, error: 'Invalid user data' });
        }
        logger_1.logger.info(`Token verification for user: ${descopeUser.sub}`);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Check if user exists by Descope ID first
        let user = await userRepository.findOne({ where: { id: descopeUser.sub } });
        let isNewUser = false;
        if (!user) {
            // Check if user exists by email (in case they have multiple Descope sessions)
            const existingUserByEmail = await userRepository.findOne({
                where: { email: descopeUser.email }
            });
            if (existingUserByEmail) {
                // User exists with same email but different Descope ID
                // Update the user ID to the new Descope ID (merge accounts)
                logger_1.logger.info(`Merging user account: updating ID from ${existingUserByEmail.id} to ${descopeUser.sub} for email ${descopeUser.email}`);
                // Update the existing user with the new Descope ID using raw SQL to avoid unique constraint issues
                await userRepository.query(`UPDATE users SET id = $1, "lastLoginAt" = $2, "emailVerified" = $3 WHERE id = $4`, [descopeUser.sub, new Date(), descopeUser.email_verified || existingUserByEmail.emailVerified, existingUserByEmail.id]);
                // Fetch the updated user
                user = await userRepository.findOne({ where: { id: descopeUser.sub } });
                if (!user) {
                    throw new Error('Failed to merge user account');
                }
                logger_1.logger.info(`Merged user account for: ${user.email} (new ID: ${user.id})`);
            }
            else {
                // Create completely new user
                user = new User_1.User();
                user.id = descopeUser.sub;
                user.email = descopeUser.email || `${descopeUser.sub}@descope.user`;
                user.passwordHash = 'descope_managed'; // Password managed by Descope
                user.emailVerified = descopeUser.email_verified || false;
                await userRepository.save(user);
                isNewUser = true;
                logger_1.logger.info(`Created new user in database: ${user.id}`);
            }
        }
        else {
            // Update last login for existing user
            user.lastLoginAt = new Date();
            user.emailVerified = descopeUser.email_verified || user.emailVerified;
            await userRepository.save(user);
            logger_1.logger.info(`Updated last login for user: ${user.id}`);
        }
        // If this is a new user and they have a referral code, process the referral
        if (isNewUser && referralCode) {
            logger_1.logger.info(`🔄 Processing referral code ${referralCode} for new user ${user.id} (${user.email})`);
            try {
                // Find the referrer by referral code
                const referrer = await userRepository.findOne({
                    where: { referralCode },
                    select: ['id', 'email']
                });
                if (referrer) {
                    logger_1.logger.info(`✅ Found referrer: ${referrer.id} (${referrer.email}) for referral code ${referralCode}`);
                    // Update the new user with the referrer ID
                    await userRepository.update(user.id, { referredBy: referrer.id });
                    logger_1.logger.info(`✅ Updated user ${user.id} with referrer ${referrer.id}`);
                    // Send referral notification email to the referrer
                    try {
                        const emailSent = await emailService_1.emailService.sendReferralNotificationEmail(referrer.email, user.email);
                        if (emailSent) {
                            logger_1.logger.info(`📧 Referral notification email sent to ${referrer.email} for new user ${user.email}`);
                        }
                        else {
                            logger_1.logger.error(`❌ Failed to send referral notification email to ${referrer.email}`);
                        }
                    }
                    catch (emailError) {
                        logger_1.logger.error('❌ Failed to send referral notification email:', emailError);
                    }
                    // Create referral notification for the referrer
                    try {
                        await notificationService_1.NotificationService.createReferralNotification(referrer.id, user.email);
                        logger_1.logger.info(`🔔 Referral notification created for user ${referrer.id} about new user ${user.email}`);
                    }
                    catch (notificationError) {
                        logger_1.logger.error('❌ Failed to create referral notification:', notificationError);
                    }
                    logger_1.logger.info(`🎉 User ${user.id} successfully joined with referral code ${referralCode} from user ${referrer.id}`);
                }
                else {
                    logger_1.logger.warn(`⚠️ Invalid referral code ${referralCode} provided by user ${user.id} - no referrer found`);
                }
            }
            catch (referralError) {
                logger_1.logger.error('❌ Error processing referral:', referralError);
                // Don't fail the auth if referral processing fails
            }
        }
        else if (isNewUser) {
            logger_1.logger.info(`ℹ️ New user ${user.id} signed up without referral code`);
        }
        else if (referralCode) {
            logger_1.logger.info(`ℹ️ Existing user ${user.id} provided referral code ${referralCode} (ignored)`);
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                payoutDetails: user.payoutDetails,
                balance: {
                    cash: Number(user.cashBalance),
                    portfolio: Number(user.portfolioBalance)
                },
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Token verification error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});
// POST /api/auth/login - Legacy endpoint (deprecated, use Descope on frontend)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        logger_1.logger.warn(`Legacy login attempt for: ${email} - should use Descope`);
        // Mock response for backward compatibility
        res.json({
            success: true,
            user: {
                id: 'user_' + Date.now(),
                email,
                username: email.split('@')[0]
            },
            token: 'mock_jwt_token_' + Date.now(),
            message: 'Use Descope authentication on frontend'
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});
// POST /api/auth/register - Legacy endpoint (deprecated, use Descope on frontend)
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        logger_1.logger.warn(`Legacy registration attempt for: ${email} - should use Descope`);
        // Mock response for backward compatibility
        res.json({
            success: true,
            user: {
                id: 'user_' + Date.now(),
                email,
                username
            },
            token: 'mock_jwt_token_' + Date.now(),
            message: 'Use Descope authentication on frontend'
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});
// POST /api/auth/logout - Logout endpoint
router.post('/logout', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        logger_1.logger.info(`Logout request for user: ${userId}`);
        // For dev authentication, we don't need to do much server-side cleanup
        // In production with Descope, you might want to revoke tokens or clear sessions
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map