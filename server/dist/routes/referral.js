"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const descopeAuth_1 = require("../middleware/descopeAuth");
const emailService_1 = require("../utils/emailService");
const notificationService_1 = require("../utils/notificationService");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// GET /api/referral/info - Get user's referral information
router.get('/info', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Get user with referral info
        const user = await userRepository.findOne({
            where: { id: userId },
            select: ['id', 'referralCode', 'referredBy', 'createdAt']
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Generate referral code if user doesn't have one
        let referralCode = user.referralCode;
        if (!referralCode) {
            referralCode = `FLY${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`;
            await userRepository.update(userId, { referralCode });
            logger_1.logger.info(`Generated referral code for user: ${userId}, code: ${referralCode}`);
        }
        // Get all users referred by this user
        const referredUsers = await userRepository.find({
            where: { referredBy: userId },
            select: ['id', 'email', 'lockedFunds', 'createdAt']
        });
        // Calculate active referrals (users with locked funds > 0)
        const activeReferrals = referredUsers.filter(ref => Number(ref.lockedFunds) > 0).length;
        const totalReferrals = referredUsers.length;
        // Calculate level: base level 1 + floor(activeReferrals / 5)
        const level = 1 + Math.floor(activeReferrals / 5);
        // Get referral link
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const referralLink = `${baseUrl}/?ref=${referralCode}`;
        res.json({
            success: true,
            referral: {
                referralCode,
                referralLink,
                totalReferrals,
                activeReferrals,
                level,
                referredUsers: referredUsers.map(ref => ({
                    id: ref.id,
                    email: ref.email,
                    isActive: Number(ref.lockedFunds) > 0,
                    joinedAt: ref.createdAt
                }))
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Referral info error:', error);
        res.status(500).json({ success: false, error: 'Failed to get referral information' });
    }
});
// POST /api/referral/join - Join with referral code (called during signup)
router.post('/join', async (req, res) => {
    try {
        const { referralCode, userId } = req.body;
        if (!referralCode || !userId) {
            return res.status(400).json({ success: false, error: 'Referral code and user ID are required' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Find the referrer by referral code
        const referrer = await userRepository.findOne({
            where: { referralCode },
            select: ['id', 'email']
        });
        if (!referrer) {
            return res.status(400).json({ success: false, error: 'Invalid referral code' });
        }
        // Get the new user's email for the notification
        const newUser = await userRepository.findOne({
            where: { id: userId },
            select: ['email']
        });
        if (!newUser) {
            return res.status(404).json({ success: false, error: 'New user not found' });
        }
        // Update the new user with the referrer ID
        await userRepository.update(userId, { referredBy: referrer.id });
        logger_1.logger.info(`User ${userId} joined with referral code ${referralCode} from user ${referrer.id}`);
        // Send referral notification email to the referrer
        try {
            await emailService_1.emailService.sendReferralNotificationEmail(referrer.email, newUser.email);
            logger_1.logger.info(`Referral notification email sent to ${referrer.email} for new user ${newUser.email}`);
        }
        catch (emailError) {
            logger_1.logger.error('Failed to send referral notification email:', emailError);
            // Don't fail the request if email fails, just log it
        }
        // Create referral notification for the referrer
        try {
            await notificationService_1.NotificationService.createReferralNotification(referrer.id, newUser.email);
            logger_1.logger.info(`Referral notification created for user ${referrer.id} about new user ${newUser.email}`);
        }
        catch (notificationError) {
            logger_1.logger.error('Failed to create referral notification:', notificationError);
            // Don't fail the request if notification creation fails, just log it
        }
        res.json({
            success: true,
            message: 'Successfully joined with referral',
            referrer: {
                id: referrer.id,
                email: referrer.email
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Referral join error:', error);
        res.status(500).json({ success: false, error: 'Failed to process referral' });
    }
});
// GET /api/referral/stats - Get referral statistics for dashboard
router.get('/stats', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        // Get all users and their referral stats
        const allUsers = await userRepository.find({
            select: ['id', 'referralCode', 'referredBy', 'lockedFunds', 'createdAt']
        });
        // Calculate referral stats for each user
        const referralStats = allUsers.map(user => {
            const referredUsers = allUsers.filter(u => u.referredBy === user.id);
            const activeReferrals = referredUsers.filter(ref => Number(ref.lockedFunds) > 0).length;
            const level = 1 + Math.floor(activeReferrals / 5);
            return {
                userId: user.id,
                referralCode: user.referralCode,
                totalReferrals: referredUsers.length,
                activeReferrals,
                level,
                referralCodeGenerated: !!user.referralCode
            };
        });
        // Get stats for current user
        const userStats = referralStats.find(stat => stat.userId === userId);
        res.json({
            success: true,
            userStats,
            globalStats: {
                totalUsers: allUsers.length,
                totalReferrals: referralStats.reduce((sum, stat) => sum + stat.totalReferrals, 0),
                totalActiveReferrals: referralStats.reduce((sum, stat) => sum + stat.activeReferrals, 0),
                averageLevel: referralStats.length > 0 ? Math.round(referralStats.reduce((sum, stat) => sum + stat.level, 0) / referralStats.length * 10) / 10 : 1
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Referral stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to get referral statistics' });
    }
});
exports.default = router;
//# sourceMappingURL=referral.js.map