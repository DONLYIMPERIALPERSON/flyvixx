"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const Notification_1 = require("../models/Notification");
const descopeAuth_1 = require("../middleware/descopeAuth");
const router = express_1.default.Router();
// GET /api/notifications - Get user's notifications
router.get('/', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        logger_1.logger.info(`Notifications request for user: ${userId}, page: ${page}, limit: ${limit}`);
        const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
        // Get notifications with pagination
        const [notifications, total] = await notificationRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
        });
        // Get unread count
        const unreadCount = await notificationRepository.count({
            where: { userId, read: false }
        });
        // Format notifications for frontend
        const formattedNotifications = notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt,
            metadata: notification.metadata
        }));
        res.json({
            success: true,
            notifications: formattedNotifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Notifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to get notifications' });
    }
});
// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        const notificationId = req.params.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
        // Find and update the notification
        const notification = await notificationRepository.findOne({
            where: { id: notificationId, userId }
        });
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }
        if (!notification.read) {
            notification.read = true;
            await notificationRepository.save(notification);
        }
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark notification read error:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
});
// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
        // Update all unread notifications for this user
        await notificationRepository.update({ userId, read: false }, { read: true });
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
    }
});
// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', descopeAuth_1.validateDescopeToken, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const notificationRepository = database_1.AppDataSource.getRepository(Notification_1.Notification);
        const unreadCount = await notificationRepository.count({
            where: { userId, read: false }
        });
        res.json({
            success: true,
            unreadCount
        });
    }
    catch (error) {
        logger_1.logger.error('Unread count error:', error);
        res.status(500).json({ success: false, error: 'Failed to get unread count' });
    }
});
exports.default = router;
//# sourceMappingURL=notification.js.map