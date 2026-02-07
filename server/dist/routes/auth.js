"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const descopeAuth_1 = require("../middleware/descopeAuth");
const descopeAuth_2 = require("../middleware/descopeAuth");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// POST /api/auth/verify - Verify Descope token and get/create user in database
router.post('/verify', descopeAuth_2.validateDescopeToken, async (req, res) => {
    try {
        const descopeUser = req.user;
        if (!descopeUser?.sub) {
            return res.status(400).json({ success: false, error: 'Invalid user data' });
        }
        logger_1.logger.info(`Token verification for user: ${descopeUser.sub}`);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Check if user exists, if not create them
        let user = await userRepository.findOne({ where: { id: descopeUser.sub } });
        if (!user) {
            // Create new user
            user = new User_1.User();
            user.id = descopeUser.sub;
            user.email = descopeUser.email || `${descopeUser.sub}@descope.user`;
            user.passwordHash = 'descope_managed'; // Password managed by Descope
            user.emailVerified = descopeUser.email_verified || false;
            await userRepository.save(user);
            logger_1.logger.info(`Created new user in database: ${user.id}`);
        }
        else {
            // Update last login
            user.lastLoginAt = new Date();
            await userRepository.save(user);
            logger_1.logger.info(`Updated last login for user: ${user.id}`);
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
router.post('/logout', descopeAuth_1.devAuth, async (req, res) => {
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