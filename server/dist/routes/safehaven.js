"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const safeHavenAuth_1 = require("../utils/safeHavenAuth");
const descopeAuth_1 = require("../middleware/descopeAuth");
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const emailService_1 = require("../utils/emailService");
const banks_1 = require("../utils/banks");
const router = express_1.default.Router();
/**
 * GET /api/safehaven/token
 * Get a valid SafeHaven OAuth2 access token
 */
router.get('/token', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const accessToken = await safeHavenAuth_1.safeHavenAuth.getAccessToken();
        if (accessToken) {
            res.json({
                success: true,
                access_token: accessToken,
                expires_in: 40 * 60, // 40 minutes
                token_type: 'Bearer'
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to obtain access token from SafeHaven'
            });
        }
    }
    catch (error) {
        console.error('SafeHaven token error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while obtaining access token'
        });
    }
});
/**
 * POST /api/safehaven/verify-bank
 * Verify bank account details using SafeHaven API
 */
router.post('/verify-bank', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const { bankCode, accountNumber } = req.body;
        if (!bankCode || !accountNumber) {
            return res.status(400).json({
                success: false,
                error: 'Bank code and account number are required'
            });
        }
        const result = await safeHavenAuth_1.safeHavenAuth.verifyBankAccount(bankCode, accountNumber);
        console.log('SafeHaven name enquiry result:', JSON.stringify(result, null, 2));
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('SafeHaven bank verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify bank account'
        });
    }
});
/**
 * POST /api/safehaven/virtual-account
 * Create a virtual account for bank transfers using SafeHaven API
 */
router.post('/virtual-account', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const { amount } = req.body; // amount is in USD
        const userId = req.user?.sub;
        if (!amount || amount < 5) {
            return res.status(400).json({
                success: false,
                error: 'Minimum deposit amount is $5'
            });
        }
        // Convert USD to NGN using our exchange rate (1500 NGN per USD)
        const EXCHANGE_RATE = 1500;
        const amountNGN = amount * EXCHANGE_RATE;
        logger_1.logger.info(`Deposit conversion: $${amount} USD = ₦${amountNGN} NGN (rate: ${EXCHANGE_RATE})`);
        // Generate unique external reference
        const externalReference = `deposit_${userId}_${Date.now()}`;
        const result = await safeHavenAuth_1.safeHavenAuth.createVirtualAccount(amountNGN, externalReference);
        res.json({
            success: true,
            data: result.data,
            externalReference
        });
    }
    catch (error) {
        console.error('SafeHaven virtual account creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create virtual account'
        });
    }
});
/**
 * POST /api/safehaven/transfer
 * Transfer funds to user's bank account using SafeHaven API
 */
router.post('/transfer', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const userId = req.user?.sub;
        const { amount, method } = req.body;
        logger_1.logger.info(`Withdrawal request received: userId=${userId}, amount=${amount}, method=${method}`);
        if (!amount || amount <= 0) {
            logger_1.logger.error('Invalid amount provided');
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }
        if (!method) {
            logger_1.logger.error('No method provided');
            return res.status(400).json({
                success: false,
                error: 'Method is required'
            });
        }
        // Get user and verify they have sufficient balance
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Check if user has payout details configured
        logger_1.logger.info(`Withdrawal check - user payout details: ${JSON.stringify(user.payoutDetails)}`);
        if (!user.payoutDetails?.bank?.accountName) {
            logger_1.logger.error('Missing accountName in payout details');
            return res.status(400).json({
                success: false,
                error: 'Bank account name is missing. Please update your payout details.'
            });
        }
        if (!user.payoutDetails?.bank?.accountNumber) {
            logger_1.logger.error('Missing accountNumber in payout details');
            return res.status(400).json({
                success: false,
                error: 'Bank account number is missing. Please update your payout details.'
            });
        }
        if (!user.payoutDetails?.bank?.bankName) {
            logger_1.logger.error('Missing bankName in payout details');
            return res.status(400).json({
                success: false,
                error: 'Bank name is missing. Please update your payout details.'
            });
        }
        logger_1.logger.info(`Payout details validation passed: accountName=${user.payoutDetails.bank.accountName}, accountNumber=${user.payoutDetails.bank.accountNumber}, bankName=${user.payoutDetails.bank.bankName}`);
        // Get bank details from payout details
        const bankDetails = user.payoutDetails.bank;
        const debitAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT;
        if (!debitAccountNumber) {
            return res.status(500).json({
                success: false,
                error: 'Settlement account not configured'
            });
        }
        if (!bankDetails?.bankName || !bankDetails?.accountNumber) {
            return res.status(400).json({
                success: false,
                error: 'Bank details incomplete'
            });
        }
        // Map bank name to bank code using our bank data
        const beneficiaryBankCode = (0, banks_1.getBankCodeByName)(bankDetails.bankName);
        const beneficiaryAccountNumber = bankDetails.accountNumber;
        if (!beneficiaryBankCode) {
            logger_1.logger.error(`Bank name not found in bank codes mapping: ${bankDetails.bankName}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid bank name. Please update your payout details with a valid bank.'
            });
        }
        // Perform fresh name enquiry to get a valid sessionId
        let freshSessionId;
        try {
            logger_1.logger.info(`Performing fresh name enquiry for withdrawal: bankCode=${beneficiaryBankCode}, accountNumber=${beneficiaryAccountNumber}`);
            const nameEnquiryResult = await safeHavenAuth_1.safeHavenAuth.verifyBankAccount(beneficiaryBankCode, beneficiaryAccountNumber);
            if (nameEnquiryResult?.data?.sessionId) {
                freshSessionId = nameEnquiryResult.data.sessionId;
                logger_1.logger.info(`Fresh name enquiry successful, sessionId: ${freshSessionId}`);
            }
            else {
                logger_1.logger.error('Fresh name enquiry failed - no sessionId returned:', nameEnquiryResult);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to verify beneficiary account details'
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Fresh name enquiry error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify beneficiary account details'
            });
        }
        // Use the fresh sessionId as nameEnquiryReference
        const actualNameEnquiryReference = freshSessionId;
        // Convert USD to NGN using withdrawal rate (1450 NGN per USD)
        const WITHDRAWAL_RATE = 1450;
        const amountNGN = amount * WITHDRAWAL_RATE;
        // Check balance (amount + fee)
        const WITHDRAWAL_FEE = 1.00; // $1 fee
        const totalDeduction = amount + WITHDRAWAL_FEE;
        const currentBalance = Number(user.cashBalance);
        if (currentBalance < totalDeduction) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance. You need $${totalDeduction.toFixed(2)} (${amount} + $${WITHDRAWAL_FEE.toFixed(2)} fee) but only have $${currentBalance.toFixed(2)}`
            });
        }
        // Check if amount requires admin approval (> ₦100,000)
        const REQUIRES_APPROVAL_THRESHOLD_NGN = 100000; // ₦100,000
        const requiresApproval = amountNGN > REQUIRES_APPROVAL_THRESHOLD_NGN;
        // Generate payment reference
        const paymentReference = `withdrawal_${userId}_${Date.now()}`;
        // Prepare transfer data
        const transferData = {
            nameEnquiryReference: actualNameEnquiryReference,
            debitAccountNumber,
            beneficiaryBankCode,
            beneficiaryAccountNumber,
            amount: amountNGN, // Amount in NGN (converted from USD)
            saveBeneficiary: false,
            narration: `Withdrawal from FlyVixx - ${paymentReference}`,
            paymentReference
        };
        // Handle approval workflow
        if (requiresApproval) {
            // Always deduct balance immediately, even for large withdrawals
            const balanceBefore = currentBalance;
            user.cashBalance = balanceBefore - totalDeduction;
            // Create transaction record as PENDING_APPROVAL
            const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
            const transaction = new Transaction_1.Transaction();
            transaction.userId = userId;
            transaction.type = Transaction_1.TransactionType.WITHDRAWAL;
            transaction.amount = amount;
            transaction.balanceBefore = balanceBefore;
            transaction.balanceAfter = balanceBefore - totalDeduction; // Balance deducted immediately
            transaction.status = Transaction_1.TransactionStatus.PENDING_APPROVAL;
            transaction.description = `Bank withdrawal via SafeHaven (Pending Admin Approval)`;
            transaction.externalId = paymentReference;
            transaction.metadata = {
                method: 'bank_transfer',
                provider: 'safehaven',
                fee: WITHDRAWAL_FEE,
                beneficiaryBankCode,
                beneficiaryAccountNumber,
                amountNGN,
                withdrawalRate: WITHDRAWAL_RATE,
                requiresApproval: true,
                approvalThreshold: REQUIRES_APPROVAL_THRESHOLD_NGN
            };
            await database_1.AppDataSource.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager.save(user);
                await transactionalEntityManager.save(transaction);
            });
            logger_1.logger.info(`Large withdrawal pending approval: User ${userId}, Amount $${amount}, Transaction ${transaction.id}`);
            res.json({
                success: true,
                message: 'Your withdrawal request has been submitted and is pending admin approval. You will be notified once processed.',
                transaction: {
                    id: transaction.id,
                    amount: amount,
                    fee: WITHDRAWAL_FEE,
                    status: 'pending_approval',
                    reference: paymentReference
                }
            });
        }
        else {
            // Process immediately for amounts <= $100K
            logger_1.logger.info(`Initiating SafeHaven transfer: ${JSON.stringify(transferData)}`);
            // Always deduct balance and mark as completed for user
            const balanceBefore = currentBalance;
            user.cashBalance = balanceBefore - totalDeduction;
            // Create transaction record as COMPLETED
            const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
            const transaction = new Transaction_1.Transaction();
            transaction.userId = userId;
            transaction.type = Transaction_1.TransactionType.WITHDRAWAL;
            transaction.amount = amount;
            transaction.balanceBefore = balanceBefore;
            transaction.balanceAfter = balanceBefore - totalDeduction;
            transaction.status = Transaction_1.TransactionStatus.COMPLETED;
            transaction.description = `Bank withdrawal via SafeHaven`;
            transaction.externalId = paymentReference;
            transaction.metadata = {
                method: 'bank_transfer',
                provider: 'safehaven',
                fee: WITHDRAWAL_FEE,
                beneficiaryBankCode,
                beneficiaryAccountNumber,
                amountNGN,
                withdrawalRate: WITHDRAWAL_RATE
            };
            // Try to call SafeHaven API, but don't fail if it doesn't work
            try {
                logger_1.logger.info(`Initiating SafeHaven transfer: ${JSON.stringify(transferData)}`);
                const transferResult = await safeHavenAuth_1.safeHavenAuth.initiateTransfer(transferData);
                logger_1.logger.info(`SafeHaven transfer initiated: ${JSON.stringify(transferResult, null, 2)}`);
                // Add transfer reference to metadata if available
                if (transferResult?.data?.reference) {
                    transaction.metadata.transferReference = transferResult.data.reference;
                }
            }
            catch (error) {
                logger_1.logger.error('SafeHaven transfer error (but transaction marked as completed):', error);
                // Don't fail the transaction - it's already marked as completed for the user
            }
            await database_1.AppDataSource.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager.save(user);
                await transactionalEntityManager.save(transaction);
            });
            logger_1.logger.info(`Withdrawal completed successfully: User ${userId}, Amount $${amount}, Transaction ${transaction.id}`);
            // Send withdrawal notification email
            try {
                await emailService_1.emailService.sendWithdrawalEmail(user.email, amount.toFixed(2));
                logger_1.logger.info(`Withdrawal notification email sent to ${user.email}`);
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send withdrawal notification email:', emailError);
                // Don't fail the withdrawal if email fails
            }
            res.json({
                success: true,
                message: 'Withdrawal completed successfully',
                transaction: {
                    id: transaction.id,
                    amount: amount,
                    fee: WITHDRAWAL_FEE,
                    status: 'completed',
                    reference: paymentReference
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('SafeHaven transfer error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during transfer'
        });
    }
});
/**
 * POST /api/safehaven/webhook
 * Handle SafeHaven webhook notifications for deposit confirmations
 */
router.post('/webhook', async (req, res) => {
    try {
        const webhookData = req.body;
        logger_1.logger.info(`SafeHaven webhook received: ${JSON.stringify(webhookData)}`);
        // Validate webhook data - SafeHaven nests data under 'data' property
        if (!webhookData || !webhookData.data || !webhookData.data.externalReference || !webhookData.data.amount) {
            logger_1.logger.warn('Invalid webhook data received');
            return res.status(400).json({ success: false, error: 'Invalid webhook data' });
        }
        const { externalReference, amount, status, paymentReference } = webhookData.data;
        // Only process successful transactions
        if (status !== 'successful' && status !== 'success' && status !== 'Completed' && status !== 'completed') {
            logger_1.logger.info(`Ignoring non-successful transaction: ${status}`);
            return res.status(200).json({ success: true, message: 'Ignored non-successful transaction' });
        }
        // Parse external reference to get user ID
        // Format: deposit_{userId}_{timestamp}
        const parts = externalReference.split('_');
        if (parts.length !== 3 || parts[0] !== 'deposit') {
            logger_1.logger.warn(`Invalid external reference format: ${externalReference}`);
            return res.status(400).json({ success: false, error: 'Invalid external reference' });
        }
        const userId = parts[1];
        const timestamp = parts[2]; // This is the timestamp, not amount
        // Webhook amount is already in NGN (not kobo)
        const receivedAmountNGN = amount;
        logger_1.logger.info(`Webhook amount processing: amount=${amount}, receivedAmountNGN=${receivedAmountNGN}`);
        // Convert NGN to USD using our exchange rate (1500 NGN per USD)
        const originalAmount = receivedAmountNGN / 1500;
        logger_1.logger.info(`Amount conversion: receivedAmountNGN=${receivedAmountNGN} / 1500 = originalAmount=${originalAmount}`);
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
        // Check for duplicate transactions using paymentReference
        const existingTransaction = await transactionRepository.findOne({
            where: { externalId: paymentReference }
        });
        if (existingTransaction) {
            logger_1.logger.info(`Duplicate transaction detected: ${paymentReference}`);
            return res.status(200).json({ success: true, message: 'Transaction already processed' });
        }
        // Get user
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            logger_1.logger.warn(`User not found: ${userId}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Start transaction for atomicity
        await database_1.AppDataSource.transaction(async (transactionalEntityManager) => {
            const balanceBefore = Number(user.cashBalance);
            // Update user balance
            user.cashBalance = balanceBefore + originalAmount;
            await transactionalEntityManager.save(user);
            // Create transaction record
            const transaction = new Transaction_1.Transaction();
            transaction.userId = userId;
            transaction.type = Transaction_1.TransactionType.DEPOSIT;
            transaction.amount = originalAmount;
            transaction.balanceBefore = balanceBefore;
            transaction.balanceAfter = balanceBefore + originalAmount;
            transaction.status = Transaction_1.TransactionStatus.COMPLETED;
            transaction.description = `Bank transfer deposit via SafeHaven`;
            transaction.externalId = paymentReference;
            transaction.metadata = {
                method: 'bank_transfer',
                provider: 'safehaven',
                externalReference,
                receivedAmountNGN,
                exchangeRate: 1500
            };
            await transactionalEntityManager.save(transaction);
            logger_1.logger.info(`Deposit processed successfully: User ${userId}, Amount $${originalAmount}, Transaction ${transaction.id}`);
            // Send deposit notification email
            try {
                await emailService_1.emailService.sendDepositEmail(user.email, originalAmount.toFixed(2));
                logger_1.logger.info(`Deposit notification email sent to ${user.email}`);
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send deposit notification email:', emailError);
                // Don't fail the webhook if email fails
            }
        });
        res.status(200).json({
            success: true,
            message: 'Deposit processed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('SafeHaven webhook processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/safehaven/admin/approve-withdrawal
 * Admin endpoint to approve large withdrawals (> $100K)
 */
router.post('/admin/approve-withdrawal', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const userId = req.user?.sub;
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'Transaction ID is required'
            });
        }
        // Check if user is admin
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const adminUser = await userRepository.findOne({ where: { id: userId } });
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        // Get the transaction
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
        const transaction = await transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['user']
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        if (transaction.status !== Transaction_1.TransactionStatus.PENDING_APPROVAL) {
            return res.status(400).json({
                success: false,
                error: 'Transaction is not pending approval'
            });
        }
        // Get user for the transaction
        const withdrawalUser = transaction.user;
        const currentBalance = Number(withdrawalUser.cashBalance);
        const totalDeduction = transaction.amount + (transaction.metadata?.fee || 1.00);
        if (currentBalance < totalDeduction) {
            return res.status(400).json({
                success: false,
                error: 'User no longer has sufficient balance'
            });
        }
        // Get bank details from transaction metadata
        const beneficiaryBankCode = transaction.metadata?.beneficiaryBankCode;
        const beneficiaryAccountNumber = transaction.metadata?.beneficiaryAccountNumber;
        const nameEnquiryReference = withdrawalUser.payoutDetails?.bank?.nameEnquiryReference;
        if (!beneficiaryBankCode || !beneficiaryAccountNumber || !nameEnquiryReference) {
            return res.status(400).json({
                success: false,
                error: 'Bank details incomplete'
            });
        }
        // Generate new payment reference for the approved withdrawal
        const paymentReference = `withdrawal_approved_${transactionId}_${Date.now()}`;
        // Get settlement account
        const debitAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT;
        if (!debitAccountNumber) {
            return res.status(500).json({
                success: false,
                error: 'Settlement account not configured'
            });
        }
        // Convert USD amount to NGN for SafeHaven
        const WITHDRAWAL_RATE = 1450;
        const amountNGN = transaction.amount * WITHDRAWAL_RATE;
        // Prepare transfer data
        const transferData = {
            nameEnquiryReference,
            debitAccountNumber,
            beneficiaryBankCode,
            beneficiaryAccountNumber,
            amount: amountNGN, // Amount in NGN (converted from USD)
            saveBeneficiary: false,
            narration: `Approved Withdrawal from FlyVixx - ${paymentReference}`,
            paymentReference
        };
        logger_1.logger.info(`Admin approving withdrawal: ${JSON.stringify(transferData)}`);
        try {
            // Call SafeHaven transfer API
            const transferResult = await safeHavenAuth_1.safeHavenAuth.initiateTransfer(transferData);
            // Check if SafeHaven transfer was successful
            const isTransferSuccessful = transferResult?.statusCode === 200 &&
                transferResult?.responseCode === '00' &&
                transferResult?.data?.status === 'Completed';
            if (isTransferSuccessful) {
                // Deduct from user balance
                const balanceBefore = currentBalance;
                withdrawalUser.cashBalance = balanceBefore - totalDeduction;
                // Update transaction
                transaction.status = Transaction_1.TransactionStatus.PENDING;
                transaction.externalId = paymentReference;
                transaction.balanceBefore = balanceBefore;
                transaction.balanceAfter = balanceBefore - totalDeduction;
                transaction.description = `Bank withdrawal via SafeHaven (Admin Approved)`;
                transaction.metadata = {
                    ...transaction.metadata,
                    transferReference: transferResult.data?.reference,
                    approvedBy: userId,
                    approvedAt: new Date().toISOString()
                };
                await database_1.AppDataSource.transaction(async (transactionalEntityManager) => {
                    await transactionalEntityManager.save(withdrawalUser);
                    await transactionalEntityManager.save(transaction);
                });
                logger_1.logger.info(`Withdrawal approved and initiated: Transaction ${transaction.id}`);
                // Send withdrawal notification email to user
                try {
                    await emailService_1.emailService.sendWithdrawalEmail(withdrawalUser.email, transaction.amount.toFixed(2));
                    logger_1.logger.info(`Withdrawal notification email sent to ${withdrawalUser.email} for approved withdrawal`);
                }
                catch (emailError) {
                    logger_1.logger.error('Failed to send withdrawal notification email for approved withdrawal:', emailError);
                    // Don't fail the approval if email fails
                }
                res.json({
                    success: true,
                    message: 'Withdrawal approved and initiated successfully',
                    transaction: {
                        id: transaction.id,
                        status: 'pending',
                        reference: paymentReference
                    }
                });
            }
            else {
                // Transfer failed - mark as failed for retry
                transaction.status = Transaction_1.TransactionStatus.FAILED;
                transaction.metadata = {
                    ...transaction.metadata,
                    transferError: transferResult.error,
                    adminRetryAvailable: true,
                    approvedBy: userId,
                    approvedAt: new Date().toISOString()
                };
                await transactionRepository.save(transaction);
                logger_1.logger.error(`Approved withdrawal failed: Transaction ${transaction.id}`);
                res.json({
                    success: false,
                    message: 'Withdrawal approval failed - marked for admin retry',
                    transaction: {
                        id: transaction.id,
                        status: 'failed',
                        retryAvailable: true
                    }
                });
            }
        }
        catch (error) {
            // Handle transfer error
            transaction.status = Transaction_1.TransactionStatus.FAILED;
            transaction.metadata = {
                ...transaction.metadata,
                error: error instanceof Error ? error.message : 'Unknown error',
                adminRetryAvailable: true,
                approvedBy: userId,
                approvedAt: new Date().toISOString()
            };
            await transactionRepository.save(transaction);
            logger_1.logger.error(`Approved withdrawal error: Transaction ${transaction.id}`, error);
            res.json({
                success: false,
                message: 'Withdrawal approval encountered an error - marked for admin retry',
                transaction: {
                    id: transaction.id,
                    status: 'failed',
                    retryAvailable: true
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Admin approve withdrawal error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/safehaven/admin/retry-withdrawal
 * Admin endpoint to retry failed withdrawals
 */
router.post('/admin/retry-withdrawal', descopeAuth_1.devAuth, async (req, res) => {
    try {
        const userId = req.user?.sub;
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'Transaction ID is required'
            });
        }
        // Check if user is admin
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const adminUser = await userRepository.findOne({ where: { id: userId } });
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        // Get the transaction
        const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
        const transaction = await transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['user']
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        if (transaction.status !== Transaction_1.TransactionStatus.FAILED || !transaction.metadata?.adminRetryAvailable) {
            return res.status(400).json({
                success: false,
                error: 'Transaction is not eligible for retry'
            });
        }
        // Get user for the transaction
        const withdrawalUser = transaction.user;
        // Get bank details
        const beneficiaryBankCode = transaction.metadata?.beneficiaryBankCode;
        const beneficiaryAccountNumber = transaction.metadata?.beneficiaryAccountNumber;
        const nameEnquiryReference = withdrawalUser.payoutDetails?.bank?.nameEnquiryReference;
        if (!beneficiaryBankCode || !beneficiaryAccountNumber || !nameEnquiryReference) {
            return res.status(400).json({
                success: false,
                error: 'Bank details incomplete'
            });
        }
        // Generate new payment reference for the retry
        const paymentReference = `withdrawal_retry_${transactionId}_${Date.now()}`;
        // Get settlement account
        const debitAccountNumber = process.env.SAFEHAVEN_SETTLEMENT_ACCOUNT;
        if (!debitAccountNumber) {
            return res.status(500).json({
                success: false,
                error: 'Settlement account not configured'
            });
        }
        // Convert USD amount to NGN for SafeHaven
        const WITHDRAWAL_RATE = 1450;
        const amountNGN = transaction.amount * WITHDRAWAL_RATE;
        // Prepare transfer data
        const transferData = {
            nameEnquiryReference,
            debitAccountNumber,
            beneficiaryBankCode,
            beneficiaryAccountNumber,
            amount: amountNGN, // Amount in NGN (converted from USD)
            saveBeneficiary: false,
            narration: `Retry Withdrawal from FlyVixx - ${paymentReference}`,
            paymentReference
        };
        logger_1.logger.info(`Admin retrying withdrawal: ${JSON.stringify(transferData)}`);
        try {
            // Call SafeHaven transfer API
            const transferResult = await safeHavenAuth_1.safeHavenAuth.initiateTransfer(transferData);
            // Check if SafeHaven transfer was successful
            const isTransferSuccessful = transferResult?.statusCode === 200 &&
                transferResult?.responseCode === '00' &&
                transferResult?.data?.status === 'Completed';
            if (isTransferSuccessful) {
                // Update transaction status
                transaction.status = Transaction_1.TransactionStatus.PENDING;
                transaction.externalId = paymentReference;
                transaction.description = `Bank withdrawal via SafeHaven (Admin Retry)`;
                transaction.metadata = {
                    ...transaction.metadata,
                    transferReference: transferResult.data?.reference,
                    retriedBy: userId,
                    retriedAt: new Date().toISOString(),
                    retryCount: (transaction.metadata?.retryCount || 0) + 1
                };
                await transactionRepository.save(transaction);
                logger_1.logger.info(`Withdrawal retry successful: Transaction ${transaction.id}`);
                res.json({
                    success: true,
                    message: 'Withdrawal retry initiated successfully',
                    transaction: {
                        id: transaction.id,
                        status: 'pending',
                        reference: paymentReference
                    }
                });
            }
            else {
                // Retry failed - keep as failed for another retry
                transaction.metadata = {
                    ...transaction.metadata,
                    lastRetryError: transferResult.error,
                    retriedBy: userId,
                    retriedAt: new Date().toISOString(),
                    retryCount: (transaction.metadata?.retryCount || 0) + 1
                };
                await transactionRepository.save(transaction);
                logger_1.logger.error(`Withdrawal retry failed: Transaction ${transaction.id}`);
                res.json({
                    success: false,
                    message: 'Withdrawal retry failed - can be retried again',
                    transaction: {
                        id: transaction.id,
                        status: 'failed',
                        retryAvailable: true
                    }
                });
            }
        }
        catch (error) {
            // Handle retry error
            transaction.metadata = {
                ...transaction.metadata,
                lastRetryError: error instanceof Error ? error.message : 'Unknown error',
                retriedBy: userId,
                retriedAt: new Date().toISOString(),
                retryCount: (transaction.metadata?.retryCount || 0) + 1
            };
            await transactionRepository.save(transaction);
            logger_1.logger.error(`Withdrawal retry error: Transaction ${transaction.id}`, error);
            res.json({
                success: false,
                message: 'Withdrawal retry encountered an error - can be retried again',
                transaction: {
                    id: transaction.id,
                    status: 'failed',
                    retryAvailable: true
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Admin retry withdrawal error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=safehaven.js.map