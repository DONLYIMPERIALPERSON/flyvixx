import express from 'express';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { Notification } from '../models/Notification';
import { validateDescopeToken } from '../middleware/descopeAuth';

const router = express.Router();

// GET /api/notifications - Get user's notifications
router.get('/', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    logger.info(`Notifications request for user: ${userId}, page: ${page}, limit: ${limit}`);

    const notificationRepository = AppDataSource.getRepository(Notification);

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
  } catch (error) {
    logger.error('Notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to get notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notificationRepository = AppDataSource.getRepository(Notification);

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
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notificationRepository = AppDataSource.getRepository(Notification);

    // Update all unread notifications for this user
    await notificationRepository.update(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notificationRepository = AppDataSource.getRepository(Notification);

    const unreadCount = await notificationRepository.count({
      where: { userId, read: false }
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    logger.error('Unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
});

export default router;