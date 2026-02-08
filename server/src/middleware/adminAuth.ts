import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { Admin, AdminStatus } from '../models/Admin';
import { logger } from '../utils/logger';

// Extend Request interface to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

// JWT payload interface for admin tokens
interface AdminJWTPayload {
  adminId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Admin authentication middleware
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required. Please provide a valid token.'
      });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_ADMIN_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_ADMIN_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    let decoded: AdminJWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as AdminJWTPayload;
    } catch (jwtError) {
      logger.warn('Invalid admin JWT token:', jwtError);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired admin token'
      });
    }

    // Validate token payload
    if (!decoded.adminId || !decoded.email) {
      logger.warn('Invalid admin JWT payload:', decoded);
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload'
      });
    }

    // Fetch admin from database
    const adminRepository = AppDataSource.getRepository(Admin);
    const admin = await adminRepository.findOne({
      where: {
        id: decoded.adminId,
        email: decoded.email,
        status: AdminStatus.ACTIVE
      }
    });

    if (!admin) {
      logger.warn(`Admin authentication failed - admin not found: ${decoded.email}`);
      return res.status(401).json({
        success: false,
        error: 'Admin account not found or inactive'
      });
    }

    // Check if admin session is still valid (optional additional check)
    // This could include checking last activity, IP restrictions, etc.

    // Update last activity timestamp
    admin.lastLoginAt = new Date();
    await adminRepository.save(admin);

    // Attach admin to request object
    req.admin = admin;

    logger.info(`Admin authenticated: ${admin.email} (${admin.id})`);

    next();
  } catch (error) {
    logger.error('Admin authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service temporarily unavailable'
    });
  }
};

// Helper function to generate admin JWT token
export const generateAdminToken = (admin: Admin): string => {
  const jwtSecret = process.env.JWT_ADMIN_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_ADMIN_SECRET not configured in environment');
    throw new Error('JWT_ADMIN_SECRET not configured');
  }

  logger.info(`Generating JWT token for admin: ${admin.email} with secret length: ${jwtSecret.length}`);

  const payload: AdminJWTPayload = {
    adminId: admin.id,
    email: admin.email
  };

  // Token expires in 8 hours for admin sessions
  const expiresIn = '8h';

  const token = jwt.sign(payload, jwtSecret, { expiresIn });
  logger.info(`JWT token generated successfully for admin: ${admin.email}`);

  return token;
};

// Helper function to verify admin token (for testing/debugging)
export const verifyAdminToken = (token: string): AdminJWTPayload | null => {
  try {
    const jwtSecret = process.env.JWT_ADMIN_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_ADMIN_SECRET not configured');
    }

    return jwt.verify(token, jwtSecret) as AdminJWTPayload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
};