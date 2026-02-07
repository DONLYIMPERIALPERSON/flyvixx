"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const Transaction_1 = require("../models/Transaction");
const User_1 = require("../models/User");
const descopeAuth_1 = require("../middleware/descopeAuth");
const router = express_1.default.Router();
// GET /api/transactions - Get user's transaction history
router.get('/', descopeAuth_1.devAuth, async (req, res) => {
    try {
        // Get user from Descope auth middleware
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        logger_1.logger.info(`Transaction history request for user: ${userId}, page: ${page}, limit: ${limit}`);
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
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
    }
    catch (error) {
        logger_1.logger.error('Transaction history error:', error);
        res.status(500).json({ success: false, error: 'Failed to get transaction history' });
    }
});
// POST /api/transactions/withdraw - Create a withdrawal transaction
router.post('/withdraw', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const userId = req.user?.sub;
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
        logger_1.logger.info(`Withdrawal request for user: ${userId}, amount: ${amount}, method: ${method}`);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
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
        logger_1.logger.info(`Withdrawal calculation: amount=${amount}, fee=${withdrawalFee}, totalCost=${totalCost}, balance=${balanceBefore}`);
        if (balanceBefore < totalCost) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance. You need $${totalCost.toFixed(2)} ($${amount} + $${withdrawalFee.toFixed(2)} fee) but only have $${balanceBefore.toFixed(2)}`
            });
        }
        // Create transaction
        const transaction = new Transaction_1.Transaction();
        transaction.userId = userId;
        transaction.type = Transaction_1.TransactionType.WITHDRAWAL;
        transaction.amount = amount;
        transaction.balanceBefore = balanceBefore;
        transaction.balanceAfter = balanceBefore - amount;
        transaction.status = Transaction_1.TransactionStatus.PENDING;
        transaction.description = `Withdrawal via ${method}`;
        transaction.metadata = { method };
        await transactionRepository.save(transaction);
        // Update user balance
        user.cashBalance = balanceBefore - amount;
        await userRepository.save(user);
        // Mark transaction as completed
        transaction.status = Transaction_1.TransactionStatus.COMPLETED;
        await transactionRepository.save(transaction);
        logger_1.logger.info(`Withdrawal completed for user: ${userId}, transaction: ${transaction.id}`);
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
    }
    catch (error) {
        logger_1.logger.error('Withdrawal error:', error);
        res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
    }
});
// POST /api/transactions/transfer - Transfer funds to another user
router.post('/transfer', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const senderId = req.user?.sub;
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
        logger_1.logger.info(`Transfer request: sender=${senderId}, recipient=${recipientEmail}, amount=${amount}`);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
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
        await database_1.AppDataSource.transaction(async (transactionalEntityManager) => {
            // Update sender balance
            sender.cashBalance = senderBalanceBefore - amount;
            await transactionalEntityManager.save(sender);
            // Update recipient balance
            const recipientBalanceBefore = Number(recipient.cashBalance);
            recipient.cashBalance = recipientBalanceBefore + amount;
            await transactionalEntityManager.save(recipient);
            // Create transaction record for sender
            const senderTransaction = new Transaction_1.Transaction();
            senderTransaction.userId = senderId;
            senderTransaction.type = Transaction_1.TransactionType.TRANSFER;
            senderTransaction.amount = -amount; // Negative amount for outgoing transfer
            senderTransaction.balanceBefore = senderBalanceBefore;
            senderTransaction.balanceAfter = senderBalanceBefore - amount;
            senderTransaction.status = Transaction_1.TransactionStatus.COMPLETED;
            senderTransaction.description = `Transfer to ${recipientEmail}`;
            senderTransaction.metadata = { recipientEmail, recipientId: recipient.id, direction: 'out' };
            await transactionalEntityManager.save(senderTransaction);
            // Create transaction record for recipient
            const recipientTransaction = new Transaction_1.Transaction();
            recipientTransaction.userId = recipient.id;
            recipientTransaction.type = Transaction_1.TransactionType.TRANSFER;
            recipientTransaction.amount = amount; // Positive amount for incoming transfer
            recipientTransaction.balanceBefore = recipientBalanceBefore;
            recipientTransaction.balanceAfter = recipientBalanceBefore + amount;
            recipientTransaction.status = Transaction_1.TransactionStatus.COMPLETED;
            recipientTransaction.description = `Transfer from ${sender.email}`;
            recipientTransaction.metadata = { senderEmail: sender.email, senderId, direction: 'in' };
            await transactionalEntityManager.save(recipientTransaction);
            logger_1.logger.info(`Transfer completed: ${senderId} -> ${recipient.id}, amount: $${amount}`);
        });
        res.json({
            success: true,
            message: `Successfully transferred $${amount} to ${recipientEmail}`,
            newBalance: Number(sender.cashBalance)
        });
    }
    catch (error) {
        logger_1.logger.error('Transfer error:', error);
        res.status(500).json({ success: false, error: 'Failed to process transfer' });
    }
});
// GET /api/transactions/balance - Get user's current balance
router.get('/balance', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
            select: ['cashBalance', 'portfolioBalance']
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
                total: totalWealth
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Balance error:', error);
        res.status(500).json({ success: false, error: 'Failed to get balance' });
    }
});
exports.default = router;
//# sourceMappingURL=transaction.js.map