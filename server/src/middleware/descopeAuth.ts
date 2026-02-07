import { Request, Response, NextFunction } from 'express';
import DescopeClient from '@descope/node-sdk';
import { logger } from '../utils/logger';

const descopeClient = DescopeClient({
  projectId: process.env.DESCOPE_PROJECT_ID || '',
  managementKey: process.env.DESCOPE_MANAGEMENT_KEY || '',
});

export interface AuthenticatedRequest extends Request {
  user?: any;
  descopeToken?: any;
}

// Descope token validation middleware
export const validateDescopeToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate the token with Descope
    const authInfo = await descopeClient.validateSession(token);

    if (!authInfo || !authInfo.token) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Attach user info and token to request
    req.user = authInfo.token;
    req.descopeToken = authInfo.token;

    logger.info(`Authenticated user: ${authInfo.token.sub}`);
    next();
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(401).json({ error: 'Token validation failed' });
  }
};

// Optional authentication middleware
export const optionalDescopeAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const authInfo = await descopeClient.validateSession(token);

      if (authInfo && authInfo.token) {
        req.user = authInfo.token;
        req.descopeToken = authInfo.token;
        logger.info(`Optional auth - authenticated user: ${authInfo.token.sub}`);
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without authentication
    logger.debug('Optional auth failed, continuing without auth:', error);
    next();
  }
};

// Development authentication middleware (allows dev login)
export const devAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for dev login cookie or header
    const devLogin = req.cookies?.devLogin || req.headers['x-dev-login'];

    if (devLogin === 'true') {
      // Mock user for development
      req.user = {
        sub: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
        email: 'ransomlucky234@gmail.com',
        email_verified: true,
        name: 'Dev User'
      };

      // Ensure dev user exists in database
      try {
        const { AppDataSource } = await import('../config/database');
        const { User } = await import('../models/User');

        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }

        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOne({ where: { id: '550e8400-e29b-41d4-a716-446655440000' } });

        if (!user) {
          user = new User();
          user.id = '550e8400-e29b-41d4-a716-446655440000';
          user.email = 'ransomlucky234@gmail.com';
          user.passwordHash = 'dev_managed';

          user.payoutDetails = {
            btc: { btcAddress: '1DevTestAddress123456789' },
            usdt: { usdtAddress: 'TDevTestAddress123456789' },
            bank: { accountName: 'Dev User', accountNumber: '1234567890', bankName: 'Dev Bank' }
          };

          await userRepository.save(user);
          logger.info('✅ Dev user created in database');
        }
      } catch (dbError) {
        logger.warn('Could not create dev user in database:', dbError);
      }

      logger.info('Dev authentication - using mock user');
      return next();
    }

    // Use normal Descope authentication for all other requests
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const authInfo = await descopeClient.validateSession(token);

    if (!authInfo || !authInfo.token) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = authInfo.token;
    req.descopeToken = authInfo.token;
    logger.info(`Authenticated user: ${authInfo.token.sub}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
