import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Game, GameStatus } from '../models/Game';
import { Bet, BetStatus, BetType } from '../models/Bet';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { NotificationService } from '../utils/notificationService';

interface ConnectedUser {
  id: string;
  socketId: string;
  username?: string;
}

interface ActiveBet {
  betId: string;
  userId: string;
  amount: number;
  betType: BetType;
  safePlay: boolean;
  cashedOutAt?: number;
  autoCashoutAt?: number;
}

interface GameRound {
  id: string;
  userId: string; // Each round belongs to a specific user
  gameId?: string; // Database game record ID
  status: 'preparing' | 'flying' | 'crashed';
  multiplier: number;
  crashPoint: number;
  startTime: number;
  crashTime?: number;
  activeBet: ActiveBet | null; // Only one bet per user per round
  roundInterval?: NodeJS.Timeout;
}

const connectedUsers = new Map<string, ConnectedUser>();
const userRounds = new Map<string, GameRound>(); // userId -> their current round

// Scalability improvements for high concurrency
const MAX_ACTIVE_ROUNDS = 1000; // Limit active rounds in memory
const ROUND_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const INACTIVE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Track round activity for cleanup
const roundActivity = new Map<string, number>();

// Cleanup inactive rounds periodically
setInterval(() => {
  const now = Date.now();
  const toCleanup: string[] = [];

  for (const [userId, lastActivity] of roundActivity) {
    if (now - lastActivity > INACTIVE_TIMEOUT) {
      toCleanup.push(userId);
    }
  }

  for (const userId of toCleanup) {
    const round = userRounds.get(userId);
    if (round) {
      // Clear interval if exists
      if (round.roundInterval) {
        clearInterval(round.roundInterval);
      }
      // Save to database before cleanup
      saveRoundToDatabase(round).catch(error => {
        logger.error(`Error saving round during cleanup for user ${userId}:`, error);
      });
      userRounds.delete(userId);
      roundActivity.delete(userId);
      logger.info(`🧹 Cleaned up inactive round for user ${userId}`);
    }
  }

  // Log memory usage
  if (userRounds.size > MAX_ACTIVE_ROUNDS * 0.8) {
    logger.warn(`⚠️ High memory usage: ${userRounds.size} active rounds (${Math.round(userRounds.size/MAX_ACTIVE_ROUNDS*100)}% of limit)`);
  }
}, ROUND_CLEANUP_INTERVAL);

// Gift Management Functions
const resetDailyGiftsForUser = async (userId: string): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (user) {
      // Reset gifts based on level (level 1 = 2 gifts, level 2 = 4 gifts, etc.)
      const giftsToReset = user.level * 2;
      user.dailyGifts = giftsToReset;
      user.giftsLastReset = new Date();
      await userRepository.save(user);

      logger.info(`🎁 Daily gifts reset for user ${userId}: ${giftsToReset} gifts (level ${user.level})`);
    }
  } catch (error) {
    logger.error('Error resetting daily gifts:', error);
  }
};

const checkAndResetGiftsIfNeeded = async (userId: string): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (user) {
      const today = new Date().toDateString();
      const lastReset = user.giftsLastReset ? new Date(user.giftsLastReset).toDateString() : null;

      if (!lastReset || lastReset !== today) {
        await resetDailyGiftsForUser(userId);
      }
    }
  } catch (error) {
    logger.error('Error checking gift reset:', error);
  }
};

const consumeGiftForUser = async (userId: string, userRepository?: any): Promise<User | null> => {
  try {
    // Use provided repository (for transactions) or default
    const repo = userRepository || AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id: userId } });

    if (!user || user.dailyGifts <= 0) {
      return null; // No gifts available
    }

    user.dailyGifts -= 1;
    user.totalFlies += 1; // Increment total flies counter
    await repo.save(user);

    logger.info(`🎁 Gift consumed for user ${userId}, remaining: ${user.dailyGifts}, totalFlies: ${user.totalFlies}`);
    return user; // Return the updated user object
  } catch (error) {
    logger.error('Error consuming gift:', error);
    return null;
  }
};

// Game Engine Functions - Optimized for performance
const generateCrashPoint = (hasActiveBet: boolean): number => {
  const rand = Math.random();

  if (hasActiveBet) {
    // Player has active bet - MUCH shorter flights to prevent big wins
    // 70% chance: Very short crashes (1.01x - 1.50x) - forces quick decisions
    if (rand < 0.70) {
      return 1.01 + (rand * 0.735); // 1.01-1.50x (very short!)
    }
    // 25% chance: Short crashes (1.51x - 2.00x) - still quick cashout needed
    if (rand < 0.95) {
      return 1.51 + ((rand - 0.70) * 1.96); // 1.51-2.00x
    }
    // 5% chance: Medium crashes (2.01x - 3.00x) - rare but possible
    return 2.01 + ((rand - 0.95) * 19.9); // 2.01-3.00x
  } else {
    // No active bet - can go higher, but still mostly short crashes
    // 60% chance: Very short crashes (1.01x - 1.50x)
    if (rand < 0.60) {
      return 1.01 + (rand * 0.735); // 1.01-1.50x
    }

    // 25% chance: Short crashes (1.51x - 3.00x)
    if (rand < 0.85) {
      return 1.51 + ((rand - 0.60) * 2.96); // 1.51-3.00x
    }

    // 10% chance: Medium crashes (3.01x - 8.00x)
    if (rand < 0.95) {
      return 3.01 + ((rand - 0.85) * 24.9); // 3.01-8.00x
    }

    // 5% chance: Long crashes (8.01x - 20.00x) - very rare
    return 8.01 + ((rand - 0.95) * 47.9); // 8.01-20.00x
  }
};

const startNewRoundForUser = async (io: Server, userId: string, socket: Socket) => {
  try {
    // Save previous round to database if it exists
    const existingRound = userRounds.get(userId);
    if (existingRound) {
      await saveRoundToDatabase(existingRound);
    }

    // Create new round for this user
    const roundId = `round_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hasActiveBet = existingRound?.activeBet ? true : false;
    const crashPoint = generateCrashPoint(hasActiveBet);

    const newRound: GameRound = {
      id: roundId,
      userId,
      status: 'preparing',
      multiplier: 1.00,
      crashPoint,
      startTime: Date.now(),
      activeBet: null
    };

    userRounds.set(userId, newRound);

    logger.info(`🎮 New round for user ${userId}: ${roundId}, crash at ${crashPoint.toFixed(2)}x (${hasActiveBet ? 'with bet' : 'no bet'})`);

    // Send round start to this user only
    socket.emit('round_start', {
      roundId,
      status: 'preparing'
    });

    // Start preparing phase (8 seconds - give users more time to place bets)
    setTimeout(() => {
      const currentRound = userRounds.get(userId);
      if (currentRound && currentRound.id === roundId) {
        startFlyingPhaseForUser(io, userId, roundId, socket);
      }
    }, 8000);

  } catch (error) {
    logger.error('Error starting new round for user:', error);
  }
};

const startFlyingPhaseForUser = (io: Server, userId: string, roundId: string, socket: Socket) => {
  const round = userRounds.get(userId);
  if (!round || round.id !== roundId) return;

  round.status = 'flying';
  round.startTime = Date.now();

  logger.info(`🚀 Round ${roundId} flying phase started for user ${userId}`);

  // Check for immediate auto-cashout for safe play bets BEFORE starting the interval
  if (round.activeBet && !round.activeBet.cashedOutAt && round.activeBet.betType === BetType.PORTFOLIO && round.activeBet.safePlay) {
    // Auto-cashout immediately at 1.0x for safe play
    round.activeBet.cashedOutAt = 1.0;
    console.log(`🛡️ Safe play auto-cashout at 1.0x`);

    // Process cashout asynchronously
    processCashoutAsync(userId, round.activeBet, round.activeBet.amount * 1.0, 1.0, round, socket).catch(error => {
      logger.error('Safe play auto-cashout failed:', error);
    });

    // Send flying start and immediate cashout notification
    socket.emit('round_flying', {
      roundId,
      multiplier: 1.00
    });

    // Trigger next round immediately since safe play cashed out
    setTimeout(() => {
      startNewRoundForUser(io, userId, socket);
    }, 2000);

    return; // Don't start the interval for safe play bets
  }

  // Send flying start to this user only
  socket.emit('round_flying', {
    roundId,
    multiplier: 1.00
  });

    // Start multiplier updates (50ms intervals) - only for non-safe-play bets
    const interval = setInterval(() => {
      const currentRound = userRounds.get(userId);
      if (!currentRound || currentRound.id !== roundId) {
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const timeIntoFlight = now - currentRound.startTime;
      const newMultiplier = 1.00 + (timeIntoFlight / 1000) * 0.05; // 5% per second growth

      // Check for crash
      if (newMultiplier >= currentRound.crashPoint) {
        triggerCrashForUser(io, userId, roundId, newMultiplier, socket);
        return;
      }

      currentRound.multiplier = newMultiplier;

      // Send multiplier update to this user only
      socket.emit('multiplier_update', {
        roundId,
        multiplier: Number(newMultiplier.toFixed(2))
      });
    }, 50);

  round.roundInterval = interval;
};

const triggerCrashForUser = async (io: Server, userId: string, roundId: string, finalMultiplier: number, socket: Socket) => {
  const round = userRounds.get(userId);
  if (!round || round.id !== roundId) return;

  // Clear interval
  if (round.roundInterval) {
    clearInterval(round.roundInterval);
    round.roundInterval = undefined;
  }

  round.status = 'crashed';
  round.multiplier = finalMultiplier;
  round.crashTime = Date.now();

  logger.info(`💥 Round ${roundId} crashed at ${finalMultiplier.toFixed(2)}x for user ${userId}`);

  // Process active bet (loss) if any
  if (round.activeBet && !round.activeBet.cashedOutAt) {
    // Special handling for safe play bets - they always cash out at 1.0x instead of losing
    if (round.activeBet.betType === BetType.PORTFOLIO && round.activeBet.safePlay) {
      console.log(`🛡️ Safe play bet protected from crash - auto-cashout at 1.0x`);
      round.activeBet.cashedOutAt = 1.0;

      // Process cashout at 1.0x multiplier
      processCashoutAsync(userId, round.activeBet, round.activeBet.amount * 1.0, 1.0, round, socket).catch(error => {
        logger.error('Safe play auto-cashout failed:', error);
      });
    } else {
      // Regular portfolio bets and cash bets lose on crash
      await processBetLoss(round.activeBet, finalMultiplier);
    }
  }

  // Send crash to this user only
  socket.emit('crash', {
    roundId,
    crashPoint: Number(finalMultiplier.toFixed(2))
  });

  // Start next round after 3 seconds
  setTimeout(() => {
    startNewRoundForUser(io, userId, socket);
  }, 3000);
};

const placeBet = async (userId: string, amount: number, betType: BetType, safePlay: boolean, socket: Socket): Promise<{ success: boolean; error?: string; betId?: string }> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    logger.info(`💰 Bet placement attempt: User ${userId}, Amount $${amount}, Type: ${betType}`);

    const round = userRounds.get(userId);
    if (!round) {
      logger.error(`❌ No active round for user ${userId}`);
      await queryRunner.rollbackTransaction();
      return { success: false, error: 'No active round' };
    }

    logger.info(`📊 Round status for user ${userId}: ${round.status}, hasActiveBet: ${!!round.activeBet}`);

    if (round.status !== 'preparing') {
      logger.error(`❌ Bet placement failed: Round not in preparing phase (${round.status}) for user ${userId}`);
      await queryRunner.rollbackTransaction();
      return { success: false, error: 'Bets can only be placed during preparing phase' };
    }

    if (round.activeBet) {
      logger.error(`❌ Bet placement failed: User ${userId} already has active bet`);
      await queryRunner.rollbackTransaction();
      return { success: false, error: 'You already have an active bet in this round' };
    }

    // Validate user
    logger.info(`🔍 Validating user ${userId} for bet placement...`);
    const userRepository = queryRunner.manager.getRepository(User);
    let user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.error(`❌ User ${userId} not found in database`);
      await queryRunner.rollbackTransaction();
      return { success: false, error: 'User not found' };
    }

    logger.info(`✅ User found: ${user.email}, balance: $${user.cashBalance}`);

    // Handle different bet types
    if (betType === BetType.CASH) {
      // Cash bet - deduct from cash balance
      const cashBalance = Number(user.cashBalance);
      if (cashBalance < amount) {
        logger.error(`❌ Insufficient cash balance: has $${cashBalance}, needs $${amount}`);
        await queryRunner.rollbackTransaction();
        return { success: false, error: `Insufficient cash balance. You have $${cashBalance.toFixed(2)}` };
      }

      user.cashBalance = cashBalance - amount;
      logger.info(`💰 Cash balance updated: $${cashBalance} -> $${user.cashBalance}`);

    } else if (betType === BetType.PORTFOLIO) {
      // Portfolio bet - consume gift (gifts are reset daily by cron job)
      const updatedUser = await consumeGiftForUser(userId, userRepository);
      if (!updatedUser) {
        logger.error(`❌ No gifts available for user ${userId}`);
        await queryRunner.rollbackTransaction();
        return { success: false, error: 'No gifts available. Gifts reset daily based on your level.' };
      }

      // Use the updated user object with consumed gift
      user = updatedUser;

      // For portfolio bets, amount is 1% of portfolio balance (read-only in UI)
      const portfolioBalance = Number(user.portfolioBalance);
      const calculatedAmount = portfolioBalance * 0.01; // 1% of portfolio

      if (calculatedAmount <= 0) {
        logger.error(`❌ Invalid portfolio balance for user ${userId}: $${portfolioBalance}`);
        await queryRunner.rollbackTransaction();
        return { success: false, error: 'Invalid portfolio balance' };
      }

      // Override the amount with calculated portfolio amount
      amount = Number(calculatedAmount.toFixed(2));
      logger.info(`📊 Portfolio bet amount calculated: $${amount} (1% of $${portfolioBalance})`);
    }

    // Ensure game exists in database
    let game;
    if (!round.gameId) {
      // Create game record if it doesn't exist
      const gameRepository = queryRunner.manager.getRepository(Game);
      game = new Game();
      game.crashPoint = round.crashPoint;
      game.status = GameStatus.PREPARING;
      game.startedAt = new Date(round.startTime);
      game.totalPlayers = 1;
      game.totalBets = 0;
      game.totalPayouts = 0;
      game = await gameRepository.save(game);
      round.gameId = game.id;
      logger.info(`🎮 Game record created: ${game.id}`);
    } else {
      const gameRepository = queryRunner.manager.getRepository(Game);
      game = await gameRepository.findOne({ where: { id: round.gameId } });
      if (!game) {
        logger.error(`❌ Game ${round.gameId} not found`);
        await queryRunner.rollbackTransaction();
        return { success: false, error: 'Game not found' };
      }
    }

    // Save user balance changes
    await userRepository.save(user);

    // Create bet record
    const betRepository = queryRunner.manager.getRepository(Bet);
    const bet = new Bet();
    bet.userId = userId;
    bet.gameId = game.id;
    bet.amount = amount;
    bet.betType = betType;
    bet.status = BetStatus.ACTIVE;
    bet.payout = 0;
    const savedBet = await betRepository.save(bet);
    logger.info(`✅ Bet record created: ${savedBet.id}, Type: ${betType}`);

    // Update game total bets
    game.totalBets = Number(game.totalBets) + Number(amount);
    await queryRunner.manager.getRepository(Game).save(game);

    // Create transaction record (only for cash bets)
    if (betType === BetType.CASH) {
      const transactionRepository = queryRunner.manager.getRepository(Transaction);
      const transaction = new Transaction();
      transaction.userId = userId;
      transaction.type = TransactionType.BET_PLACED;
      transaction.amount = -amount; // Negative for outgoing
      transaction.balanceBefore = Number(user.cashBalance) + amount; // Before deduction
      transaction.balanceAfter = Number(user.cashBalance);
      transaction.status = TransactionStatus.COMPLETED;
      transaction.description = `Cash bet placed in round ${round.id}`;
      await transactionRepository.save(transaction);
      logger.info(`✅ Cash transaction record created`);
    } else {
      // Portfolio bet - no transaction record needed (no money deducted)
      logger.info(`📊 Portfolio bet placed - no transaction record needed`);
    }

    // Set active bet
    const activeBet: ActiveBet = {
      betId: savedBet.id,
      userId,
      amount,
      betType,
      safePlay
    };
    round.activeBet = activeBet;

    // For safe play bets, auto-cashout immediately at 1.0x
    if (betType === BetType.PORTFOLIO && safePlay) {
      console.log(`🛡️ Safe play bet auto-cashout triggered immediately at 1.0x`);
      activeBet.cashedOutAt = 1.0;

      // Process cashout asynchronously
      processCashoutAsync(userId, activeBet, amount * 1.0, 1.0, round, socket).then(() => {
        // Notify frontend of the auto-cashout
        socket.emit('cashed_out', {
          success: true,
          payout: Number((amount * 1.0).toFixed(2)),
          multiplier: 1.0
        });
        console.log('✅ Safe play auto-cashout notification sent to frontend');
      }).catch(error => {
        logger.error('Safe play immediate cashout failed:', error);
      });
    }

    // Commit transaction
    await queryRunner.commitTransaction();

    // Send balance update to user - ensure proper number conversion
    const cashBalance = Number(user.cashBalance) || 0;
    const portfolioBalance = Number(user.portfolioBalance) || 0;

    socket.emit('balance_update', {
      cashBalance: Number(cashBalance.toFixed(2)),
      portfolioBalance: Number(portfolioBalance.toFixed(2))
    });

    logger.info(`💰 Bet placed: User ${userId}, Amount $${amount}, Type: ${betType}, Round ${round.id}, Bet ID ${savedBet.id}`);

    return { success: true, betId: savedBet.id };

  } catch (error) {
    logger.error('Error placing bet:', error);
    await queryRunner.rollbackTransaction();
    return { success: false, error: 'Failed to place bet' };
  } finally {
    await queryRunner.release();
  }
};

const cashOut = async (userId: string, socket: Socket): Promise<{ success: boolean; error?: string; payout?: number; multiplier?: number }> => {
  try {
    logger.info(`💸 Cashout attempt for user ${userId}`);

    const round = userRounds.get(userId);
    logger.info(`📊 Round status: ${round ? round.status : 'no round'}, activeBet: ${round?.activeBet ? 'exists' : 'none'}`);

    if (!round) {
      logger.error(`❌ No round found for user ${userId}`);
      return { success: false, error: 'No active round' };
    }

    if (round.status !== 'flying') {
      logger.error(`❌ Cannot cash out - round status: ${round.status}`);
      return { success: false, error: 'Cannot cash out at this time' };
    }

    const activeBet = round.activeBet;
    if (!activeBet) {
      logger.error(`❌ No active bet found for user ${userId}`);
      return { success: false, error: 'No active bet to cash out' };
    }

    if (activeBet.cashedOutAt) {
      logger.error(`❌ Bet already cashed out at ${activeBet.cashedOutAt}x`);
      return { success: false, error: 'Bet already cashed out' };
    }

    const payout = activeBet.amount * round.multiplier;
    const multiplier = round.multiplier;

    // Mark bet as cashed out immediately for UI feedback
    activeBet.cashedOutAt = multiplier;

    logger.info(`💸 Cashout validated: User ${userId}, Multiplier ${multiplier.toFixed(2)}x, Payout $${payout.toFixed(2)}`);

    // Process database operations asynchronously (don't wait for response)
    processCashoutAsync(userId, activeBet, payout, multiplier, round, socket).catch(error => {
      logger.error('Async cashout processing failed:', error);
    });

    return {
      success: true,
      payout: Number(payout.toFixed(2)),
      multiplier: Number(multiplier.toFixed(2))
    };

  } catch (error) {
    logger.error('Error validating cashout:', error);
    return { success: false, error: 'Failed to cash out' };
  }
};

// Async function to handle all database operations after sending response
const processCashoutAsync = async (userId: string, activeBet: ActiveBet, payout: number, multiplier: number, round: GameRound, socket: Socket) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    logger.info(`🔄 Processing cashout database operations for user ${userId}`);

    // Get bet type first
    const betRepository = queryRunner.manager.getRepository(Bet);
    const betRecord = await betRepository.findOne({ where: { id: activeBet.betId } });
    if (!betRecord) {
      throw new Error('Bet record not found during cashout processing');
    }

    const betType = betRecord.betType;

    // Update user balance and portfolio profit tracking
    const userRepository = queryRunner.manager.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found during async processing');
    }

    const balanceBefore = Number(user.cashBalance);

    if (betType === BetType.CASH) {
      // Cash bet: add payout to cash balance
      user.cashBalance = balanceBefore + payout;
      logger.info(`💰 Cash bet cashout: balance ${balanceBefore} -> ${user.cashBalance}`);
    } else if (betType === BetType.PORTFOLIO) {
      // Portfolio bet: add payout to cash balance and track portfolio profit
      user.cashBalance = balanceBefore + payout;
      user.totalPortfolioProfit = Number(user.totalPortfolioProfit) + payout;
      logger.info(`📊 Portfolio bet cashout: cash balance ${balanceBefore} -> ${user.cashBalance}, total profit now ${user.totalPortfolioProfit}`);
    }

    await userRepository.save(user);

    // Update bet record
    betRecord.status = BetStatus.CASHED_OUT;
    betRecord.cashedOutAt = multiplier;
    betRecord.payout = payout;
    betRecord.cashedOutAtTime = new Date();
    await betRepository.save(betRecord);

    // Update game total payouts
    if (round.gameId) {
      const gameRepository = queryRunner.manager.getRepository(Game);
      const game = await gameRepository.findOne({ where: { id: round.gameId } });
      if (game) {
        game.totalPayouts = Number(game.totalPayouts) + Number(payout);
        await gameRepository.save(game);
      }
    }

    // Create transaction record
    const transactionRepository = queryRunner.manager.getRepository(Transaction);
    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.type = TransactionType.CASH_OUT;
    transaction.amount = payout;
    transaction.balanceBefore = balanceBefore;
    transaction.balanceAfter = Number(user.cashBalance);
    transaction.status = TransactionStatus.COMPLETED;
    transaction.description = `${betType === BetType.PORTFOLIO ? 'Portfolio' : 'Cash'} bet cashed out at ${multiplier.toFixed(2)}x in round ${round.id}`;
    await transactionRepository.save(transaction);

    // Commit transaction
    await queryRunner.commitTransaction();

    // Send balance update to user
    socket.emit('balance_update', {
      cashBalance: Number(Number(user.cashBalance).toFixed(2)),
      portfolioBalance: Number(Number(user.portfolioBalance).toFixed(2))
    });

    logger.info(`✅ Cashout database operations completed for user ${userId} (${betType} bet)`);

    // Send notification (async, don't wait)
    const notificationMessage = betType === BetType.PORTFOLIO
      ? `Portfolio play successful! You earned $${payout.toFixed(2)} at ${multiplier.toFixed(2)}x`
      : `You cashed out $${payout.toFixed(2)} at ${multiplier.toFixed(2)}x multiplier`;

    NotificationService.createSystemNotification(
      userId,
      'Cash Out Successful',
      notificationMessage
    ).catch(notificationError => {
      logger.error('Failed to send cashout notification:', notificationError);
    });

  } catch (error) {
    logger.error('Error in async cashout processing:', error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};

const processBetLoss = async (bet: ActiveBet, crashMultiplier: number) => {
  try {
    // Get bet type first
    const betRepository = AppDataSource.getRepository(Bet);
    const betRecord = await betRepository.findOne({ where: { id: bet.betId } });
    if (!betRecord) {
      logger.error('Bet record not found during loss processing');
      return;
    }

    const betType = betRecord.betType;

    // Update bet record
    betRecord.status = BetStatus.LOST;
    await betRepository.save(betRecord);

    if (betType === BetType.CASH) {
      // Cash bet loss - create transaction record (money was already deducted)
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const transaction = new Transaction();
      transaction.userId = bet.userId;
      transaction.type = TransactionType.BET_PLACED; // Loss is recorded as bet placement
      transaction.amount = -bet.amount;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.description = `Cash bet lost at ${crashMultiplier.toFixed(2)}x crash`;
      transaction.metadata = { crashMultiplier };

      // Get current balance for balance tracking
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: bet.userId } });
      if (user) {
        transaction.balanceBefore = Number(user.cashBalance) + bet.amount; // Before loss was already deducted
        transaction.balanceAfter = Number(user.cashBalance);
        await transactionRepository.save(transaction);
      }

      logger.info(`💔 Cash bet lost: User ${bet.userId}, Amount $${bet.amount}, Crash at ${crashMultiplier.toFixed(2)}x`);
    } else if (betType === BetType.PORTFOLIO) {
      // Portfolio bet loss - no money was deducted, so no transaction record needed
      logger.info(`📊 Portfolio bet lost: User ${bet.userId}, Amount $${bet.amount}, Crash at ${crashMultiplier.toFixed(2)}x (no money lost)`);
    }

  } catch (error) {
    logger.error('Error processing bet loss:', error);
  }
};

const saveRoundToDatabase = async (round: GameRound) => {
  try {
    const gameRepository = AppDataSource.getRepository(Game);
    const game = new Game();
    // Don't set ID - let TypeORM auto-generate UUID
    game.crashPoint = round.crashPoint;
    game.status = round.status === 'crashed' ? GameStatus.COMPLETED : GameStatus.CRASHED;
    game.startedAt = new Date(round.startTime);
    if (round.crashTime) {
      game.crashedAt = new Date(round.crashTime);
    }
    game.totalPlayers = 1; // Individual rounds
    game.totalBets = round.activeBet ? round.activeBet.amount : 0;
    game.totalPayouts = 0; // Calculate this properly later

    await gameRepository.save(game);

    logger.info(`💾 Round ${round.id} saved to database with UUID`);
  } catch (error) {
    logger.error('Error saving round to database:', error);
  }
};

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 User connected: ${socket.id}`);

    // Handle user joining
    socket.on('join_game', (data: { userId: string; username?: string }) => {
      const user: ConnectedUser = {
        id: data.userId,
        socketId: socket.id,
        username: data.username
      };

      connectedUsers.set(socket.id, user);
      roundActivity.set(data.userId, Date.now()); // Track activity

      logger.info(`🎮 User ${data.userId} joined game room`);

      // Start their personal game round
      startNewRoundForUser(io, data.userId, socket);

      socket.emit('joined_game', { success: true });
    });

    // Handle bet placement
    socket.on('place_bet', async (data: { amount: number; betType: BetType; safePlay?: boolean }) => {
      console.log('📡 Received place_bet event:', data);
      const user = connectedUsers.get(socket.id);
      if (!user) {
        console.error('❌ User not authenticated for bet placement');
        socket.emit('bet_error', { error: 'User not authenticated' });
        return;
      }

      // Update activity timestamp
      roundActivity.set(user.id, Date.now());

      console.log('🎯 Processing bet for user:', user.id);
      const result = await placeBet(user.id, data.amount, data.betType, data.safePlay || false, socket);
      console.log('📊 Bet placement result:', result);

      if (result.success) {
        console.log('✅ Emitting bet_placed event');
        socket.emit('bet_placed', { success: true, betId: result.betId });
      } else {
        console.error('❌ Emitting bet_error event:', result.error);
        socket.emit('bet_error', { error: result.error });
      }
    });

    // Handle cashout
    socket.on('cash_out', async () => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('cashout_error', { error: 'User not authenticated' });
        return;
      }

      // Update activity timestamp
      roundActivity.set(user.id, Date.now());

      const result = await cashOut(user.id, socket);
      if (result.success) {
        socket.emit('cashed_out', {
          success: true,
          payout: result.payout,
          multiplier: result.multiplier
        });
      } else {
        socket.emit('cashout_error', { error: result.error });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        logger.info(`🔌 User disconnected: ${user.id}`);

        // Clean up user's round if they disconnect
        const round = userRounds.get(user.id);
        if (round) {
          // Clear any active intervals
          if (round.roundInterval) {
            clearInterval(round.roundInterval);
            round.roundInterval = undefined;
          }

          // Process any active bet as loss if they disconnect during flight
          if (round.activeBet && !round.activeBet.cashedOutAt && round.status === 'flying') {
            logger.info(`💔 Processing bet loss for disconnected user ${user.id}`);
            processBetLoss(round.activeBet, round.multiplier).catch(error => {
              logger.error('Error processing bet loss on disconnect:', error);
            });
          }

          // Save round to database
          saveRoundToDatabase(round).catch(error => {
            logger.error('Error saving round on disconnect:', error);
          });

          // Remove from memory
          userRounds.delete(user.id);
        }

        connectedUsers.delete(socket.id);
      }
    });

    // Handle heartbeat
    socket.on('heartbeat', () => {
      socket.emit('heartbeat_ack');
    });
  });

  // Broadcast game state updates (for future real-time multiplier)
  const broadcastGameState = (state: any) => {
    io.to('game_room').emit('game_state', state);
  };

  // Export for use in other modules
  return { broadcastGameState };
};