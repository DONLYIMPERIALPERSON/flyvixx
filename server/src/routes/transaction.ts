import express from 'express';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { User } from '../models/User';
import { validateDescopeToken } from '../middleware/descopeAuth';
import { NotificationService } from '../utils/notificationService';

const router = express.Router();

// GET /api/transactions - Get user's transaction history
router.get('/', validateDescopeToken, async (req, res) => {
  try {
    // Get user from Descope auth middleware
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    logger.info(`Transaction history request for user: ${userId}, page: ${page}, limit: ${limit}`);

    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get transactions with pagination
    const [transactions, total] = await transactionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit
    });

    // Format transactions for frontend
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
      metadata: transaction.metadata
    }));

    res.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Transaction history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get transaction history' });
  }
});



// POST /api/transactions/withdraw - Create a withdrawal transaction
router.post('/withdraw', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Validate minimum withdrawal amount
    if (amount < 10) {
      return res.status(400).json({ success: false, error: 'Minimum withdrawal amount is $10' });
    }

    logger.info(`Withdrawal request for user: ${userId}, amount: ${amount}, method: ${method}`);

    const userRepository = AppDataSource.getRepository(User);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user and current balance
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const balanceBefore = Number(user.cashBalance);

    // Calculate withdrawal fee based on method
    let withdrawalFee = 0;
    switch (method) {
      case 'btc':
        withdrawalFee = 5.00;
        break;
      case 'usdt':
        withdrawalFee = 2.00;
        break;
      case 'bank':
        withdrawalFee = 1.00;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid withdrawal method' });
    }

    const totalCost = amount + withdrawalFee;

    logger.info(`Withdrawal calculation: amount=${amount}, fee=${withdrawalFee}, totalCost=${totalCost}, balance=${balanceBefore}`);

    if (balanceBefore < totalCost) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. You need $${totalCost.toFixed(2)} ($${amount} + $${withdrawalFee.toFixed(2)} fee) but only have $${balanceBefore.toFixed(2)}`
      });
    }

    // Create transaction
    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.type = TransactionType.WITHDRAWAL;
    transaction.amount = amount;
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = balanceBefore - amount;
    transaction.status = TransactionStatus.PENDING;
    transaction.description = `Withdrawal via ${method}`;
    transaction.metadata = { method };

    await transactionRepository.save(transaction);

    // Update user balance
    user.cashBalance = balanceBefore - amount;
    await userRepository.save(user);

    // Mark transaction as completed
    transaction.status = TransactionStatus.COMPLETED;
    await transactionRepository.save(transaction);

    logger.info(`Withdrawal completed for user: ${userId}, transaction: ${transaction.id}`);

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        balanceBefore: Number(transaction.balanceBefore),
        balanceAfter: Number(transaction.balanceAfter),
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt
      },
      newBalance: Number(user.cashBalance)
    });
  } catch (error) {
    logger.error('Withdrawal error:', error);
    res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
  }
});

// POST /api/transactions/transfer - Transfer funds to another user
router.post('/transfer', validateDescopeToken, async (req, res) => {
  try {
    const senderId = (req as any).user?.sub;
    if (!senderId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { amount, recipientEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (amount < 1) {
      return res.status(400).json({ success: false, error: 'Minimum transfer amount is $1' });
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid recipient email' });
    }

    logger.info(`Transfer request: sender=${senderId}, recipient=${recipientEmail}, amount=${amount}`);

    const userRepository = AppDataSource.getRepository(User);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get sender
    const sender = await userRepository.findOne({ where: { id: senderId } });
    if (!sender) {
      return res.status(404).json({ success: false, error: 'Sender not found' });
    }

    // Get recipient by email
    const recipient = await userRepository.findOne({ where: { email: recipientEmail } });
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    if (recipient.id === sender.id) {
      return res.status(400).json({ success: false, error: 'Cannot transfer to yourself' });
    }

    const senderBalanceBefore = Number(sender.cashBalance);

    // Check if sender has sufficient balance
    if (senderBalanceBefore < amount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. You have $${senderBalanceBefore.toFixed(2)} but need $${amount.toFixed(2)}`
      });
    }

    // Start transaction for atomicity
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Update sender balance
      sender.cashBalance = senderBalanceBefore - amount;
      await transactionalEntityManager.save(sender);

      // Update recipient balance
      const recipientBalanceBefore = Number(recipient.cashBalance);
      recipient.cashBalance = recipientBalanceBefore + amount;
      await transactionalEntityManager.save(recipient);

      // Create transaction record for sender
      const senderTransaction = new Transaction();
      senderTransaction.userId = senderId;
      senderTransaction.type = TransactionType.TRANSFER;
      senderTransaction.amount = -amount; // Negative amount for outgoing transfer
      senderTransaction.balanceBefore = senderBalanceBefore;
      senderTransaction.balanceAfter = senderBalanceBefore - amount;
      senderTransaction.status = TransactionStatus.COMPLETED;
      senderTransaction.description = `Transfer to ${recipientEmail}`;
      senderTransaction.metadata = { recipientEmail, recipientId: recipient.id, direction: 'out' };
      await transactionalEntityManager.save(senderTransaction);

      // Create transaction record for recipient
      const recipientTransaction = new Transaction();
      recipientTransaction.userId = recipient.id;
      recipientTransaction.type = TransactionType.TRANSFER;
      recipientTransaction.amount = amount; // Positive amount for incoming transfer
      recipientTransaction.balanceBefore = recipientBalanceBefore;
      recipientTransaction.balanceAfter = recipientBalanceBefore + amount;
      recipientTransaction.status = TransactionStatus.COMPLETED;
      recipientTransaction.description = `Transfer from ${sender.email}`;
      recipientTransaction.metadata = { senderEmail: sender.email, senderId, direction: 'in' };
      await transactionalEntityManager.save(recipientTransaction);

      logger.info(`Transfer completed: ${senderId} -> ${recipient.id}, amount: $${amount}`);
    });

    res.json({
      success: true,
      message: `Successfully transferred $${amount} to ${recipientEmail}`,
      newBalance: Number(sender.cashBalance)
    });
  } catch (error) {
    logger.error('Transfer error:', error);
    res.status(500).json({ success: false, error: 'Failed to process transfer' });
  }
});

// GET /api/transactions/balance - Get user's current balance
router.get('/balance', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['cashBalance', 'portfolioBalance', 'lockedFunds', 'lockedUntil']
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const totalWealth = Number(user.cashBalance) + Number(user.portfolioBalance);

    res.json({
      success: true,
      balance: {
        cash: Number(user.cashBalance),
        portfolio: Number(user.portfolioBalance),
        lockedFunds: Number(user.lockedFunds),
        lockedUntil: user.lockedUntil,
        total: totalWealth
      }
    });
  } catch (error) {
    logger.error('Balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to get balance' });
  }
});

// POST /api/transactions/lock-funds - Lock funds in portfolio for 30 days
router.post('/lock-funds', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Validate minimum lock amount
    if (amount < 10) {
      return res.status(400).json({ success: false, error: 'Minimum lock amount is $10' });
    }

    logger.info(`Lock funds request for user: ${userId}, amount: ${amount}`);

    const userRepository = AppDataSource.getRepository(User);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user and current balance
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user already has locked funds
    if (user.lockedFunds > 0) {
      return res.status(400).json({ success: false, error: 'You already have locked funds. Wait for current lock period to expire.' });
    }

    const cashBalanceBefore = Number(user.cashBalance);

    // Check if user has sufficient cash balance
    if (cashBalanceBefore < amount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient cash balance. You have $${cashBalanceBefore.toFixed(2)} but need $${amount.toFixed(2)}`
      });
    }

    // Calculate lock period (30 days from now for a full 30-day lock)
    const lockedUntil = new Date();
    lockedUntil.setDate(lockedUntil.getDate() + 30);

    // Start transaction for atomicity
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // Update user balances and lock info
      user.cashBalance = cashBalanceBefore - amount;
      user.portfolioBalance = Number(user.portfolioBalance) + amount;
      user.lockedFunds = amount;
      user.lockedUntil = lockedUntil;
      await transactionalEntityManager.save(user);

      // Create transaction record
      const transaction = new Transaction();
      transaction.userId = userId;
      transaction.type = TransactionType.LOCK_FUNDS;
      transaction.amount = amount;
      transaction.balanceBefore = cashBalanceBefore;
      transaction.balanceAfter = cashBalanceBefore - amount;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.description = `Locked funds in portfolio for 30 days`;
      transaction.metadata = {
        lockedUntil: lockedUntil.toISOString(),
        lockPeriodDays: 30
      };
      await transactionalEntityManager.save(transaction);

      // Create lock funds notification
      try {
        await NotificationService.createLockFundsNotification(userId, amount);
        logger.info(`Lock funds notification created for user ${userId}`);
      } catch (notificationError) {
        logger.error('Failed to create lock funds notification:', notificationError);
        // Don't fail the lock funds operation if notification creation fails
      }

      logger.info(`Funds locked for user: ${userId}, amount: $${amount}, locked until: ${lockedUntil.toISOString()}`);
    });

    res.json({
      success: true,
      message: `Successfully locked $${amount} in portfolio for 30 days`,
      lockedUntil: lockedUntil.toISOString(),
      newBalances: {
        cash: Number(user.cashBalance),
        portfolio: Number(user.portfolioBalance),
        lockedFunds: Number(user.lockedFunds)
      }
    });
  } catch (error) {
    logger.error('Lock funds error:', error);
    res.status(500).json({ success: false, error: 'Failed to lock funds' });
  }
});

// GET /api/transactions/portfolio - Get user's portfolio information
router.get('/portfolio', validateDescopeToken, async (req, res) => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'lockedFunds', 'lockedUntil', 'portfolioBalance', 'cashBalance']
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const now = new Date();
    let shouldAutoUnlock = false;

    // Check if lock period has expired and auto-unlock if needed
    if (user.lockedFunds > 0 && user.lockedUntil && user.lockedUntil <= now) {
      const originalLockDate = user.lockedUntil.toISOString();
      logger.info(`Auto-unlocking expired funds for user: ${userId}, lockedFunds: $${user.lockedFunds}, expired: ${originalLockDate}`);

      // Auto-unlock: move funds from portfolio back to cash
      const portfolioBalanceBefore = Number(user.portfolioBalance);
      const cashBalanceBefore = Number(user.cashBalance);
      const lockedAmount = Number(user.lockedFunds);

      await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Update user balances
        user.portfolioBalance = portfolioBalanceBefore - lockedAmount;
        user.cashBalance = cashBalanceBefore + lockedAmount;
        user.lockedFunds = 0;
        user.lockedUntil = undefined;
        await transactionalEntityManager.save(user);

        // Create transaction record for auto-unlock
        const unlockTransaction = new Transaction();
        unlockTransaction.userId = userId;
        unlockTransaction.type = TransactionType.UNLOCK_FUNDS;
        unlockTransaction.amount = lockedAmount;
        unlockTransaction.balanceBefore = cashBalanceBefore;
        unlockTransaction.balanceAfter = cashBalanceBefore + lockedAmount;
        unlockTransaction.status = TransactionStatus.COMPLETED;
        unlockTransaction.description = `Auto-unlocked funds after 30-day lock period`;
        unlockTransaction.metadata = {
          autoUnlock: true,
          originalLockDate,
          lockPeriodDays: 30
        };
        await transactionalEntityManager.save(unlockTransaction);

        // Create unlock funds notification
        try {
          await NotificationService.createUnlockFundsNotification(userId, lockedAmount);
          logger.info(`Unlock funds notification created for user ${userId}`);
        } catch (notificationError) {
          logger.error('Failed to create unlock funds notification:', notificationError);
          // Don't fail the unlock operation if notification creation fails
        }

        logger.info(`Auto-unlock completed for user: ${userId}, amount: $${lockedAmount}, transaction: ${unlockTransaction.id}`);
      });

      shouldAutoUnlock = true;
    }

    // Get referral information for level calculation
    const referredUsers = await userRepository.find({
      where: { referredBy: userId },
      select: ['lockedFunds']
    });

    // Calculate active referrals (users with locked funds > 0)
    const activeReferrals = referredUsers.filter(ref => Number(ref.lockedFunds) > 0).length;

    // Calculate level: base level 1 + floor(activeReferrals / 5)
    const level = 1 + Math.floor(activeReferrals / 5);

    // Recalculate lock status after potential auto-unlock
    const isLocked = user.lockedFunds > 0 && user.lockedUntil && user.lockedUntil > now;
    const daysLeft = user.lockedUntil ? Math.ceil((user.lockedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const response: any = {
      success: true,
      portfolio: {
        hasLockedFunds: isLocked,
        lockedFunds: Number(user.lockedFunds),
        lockedUntil: user.lockedUntil?.toISOString(),
        daysLeft: isLocked ? daysLeft : 0,
        portfolioBalance: Number(user.portfolioBalance),
        canLockFunds: !isLocked,
        level,
        activeReferrals
      }
    };

    if (shouldAutoUnlock) {
      response.portfolio.autoUnlocked = true;
      response.portfolio.unlockMessage = `Your 30-day lock period has expired. $${Number(user.lockedFunds) + Number(user.portfolioBalance) - Number(user.portfolioBalance)} has been automatically unlocked and moved back to your cash balance.`;
    }

    res.json(response);
  } catch (error) {
    logger.error('Portfolio info error:', error);
    res.status(500).json({ success: false, error: 'Failed to get portfolio information' });
  }
});

export default router;
