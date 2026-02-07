import express from 'express';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { validateDescopeToken } from '../middleware/descopeAuth';

const router = express.Router();

// Validation function for payout details
function validatePayoutDetails(payoutDetails: any): string | null {
  if (typeof payoutDetails !== 'object' || payoutDetails === null) {
    return 'Payout details must be an object';
  }

  // Validate BTC details
  if (payoutDetails.btc) {
    if (typeof payoutDetails.btc !== 'object') {
      return 'BTC payout details must be an object';
    }
    if (payoutDetails.btc.btcAddress && typeof payoutDetails.btc.btcAddress !== 'string') {
      return 'BTC address must be a string';
    }
    if (payoutDetails.btc.btcAddress && payoutDetails.btc.btcAddress.trim().length === 0) {
      return 'BTC address cannot be empty';
    }
    // Basic BTC address validation (starts with 1, 3, or bc1)
    if (payoutDetails.btc.btcAddress && !/^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[0-9A-Za-z]{39,59})$/.test(payoutDetails.btc.btcAddress)) {
      return 'Invalid BTC address format';
    }
  }

  // Validate USDT details
  if (payoutDetails.usdt) {
    if (typeof payoutDetails.usdt !== 'object') {
      return 'USDT payout details must be an object';
    }
    if (payoutDetails.usdt.usdtAddress && typeof payoutDetails.usdt.usdtAddress !== 'string') {
      return 'USDT address must be a string';
    }
    if (payoutDetails.usdt.usdtAddress && payoutDetails.usdt.usdtAddress.trim().length === 0) {
      return 'USDT address cannot be empty';
    }
    // Basic TRC20 address validation (starts with T)
    if (payoutDetails.usdt.usdtAddress && !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(payoutDetails.usdt.usdtAddress)) {
      return 'Invalid USDT (TRC20) address format';
    }
  }

  // Validate bank details
  if (payoutDetails.bank) {
    if (typeof payoutDetails.bank !== 'object') {
      return 'Bank payout details must be an object';
    }

    const requiredFields = ['accountName', 'accountNumber', 'bankName'];
    for (const field of requiredFields) {
      if (!payoutDetails.bank[field] || typeof payoutDetails.bank[field] !== 'string') {
        return `Bank ${field} is required and must be a string`;
      }
      if (payoutDetails.bank[field].trim().length === 0) {
        return `Bank ${field} cannot be empty`;
      }
    }

    // Validate account number (basic check for numbers and dashes)
    if (!/^[0-9\-]+$/.test(payoutDetails.bank.accountNumber)) {
      return 'Account number can only contain numbers and dashes';
    }
  }

  return null; // No validation errors
}

// GET /api/user/profile
router.get('/profile', validateDescopeToken, async (req, res) => {
  try {
    // Get user from Descope auth middleware
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    logger.info('Profile request for user:', userId);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'payoutDetails',
        'cashBalance',
        'portfolioBalance',
        'role',
        'status',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logger.error('Profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', validateDescopeToken, async (req, res) => {
  try {
    // Get user from Descope auth middleware
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    logger.info('Profile update request for user:', userId);

    const { payoutDetails } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update payout details if provided
    if (payoutDetails !== undefined) {
      logger.info('Updating payout details:', JSON.stringify(payoutDetails, null, 2));

      // Validate payout details structure
      const validationError = validatePayoutDetails(payoutDetails);
      if (validationError) {
        logger.error('Payout details validation error:', validationError);
        return res.status(400).json({ success: false, error: validationError });
      }

      user.payoutDetails = payoutDetails;
      user.updatedAt = new Date();
      logger.info('Payout details updated successfully');
    }

    await userRepository.save(user);

    res.json({
      success: true,
      message: 'Profile updated successfully',
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});



// GET /api/user/balance
router.get('/balance', validateDescopeToken, async (req, res) => {
  try {
    // Get user from Descope auth middleware
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    logger.info('Balance request for user:', userId);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['cashBalance', 'portfolioBalance']
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      balance: {
        cash: Number(user.cashBalance),
        portfolio: Number(user.portfolioBalance)
      }
    });
  } catch (error) {
    logger.error('Balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to get balance' });
  }
});

export default router;
