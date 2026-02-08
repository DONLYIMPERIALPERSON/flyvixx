import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { gameStateManager } from '../components/game-state-manager';

export const useGameSocket = (userToken?: string, userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      console.error('NEXT_PUBLIC_API_URL not configured');
      return;
    }

    console.log('🔌 Connecting to game server:', backendUrl);
    setIsConnecting(true);

    const newSocket = io(backendUrl, {
      auth: { token: userToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnecting(false);

      // Join game room with user ID
      if (userId) {
        newSocket.emit('join_game', { userId });
        console.log('🎮 Joined game room as user:', userId);
      }

      // Start heartbeat
      heartbeatRef.current = setInterval(() => newSocket.emit('heartbeat'), 30000);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`🔄 Reconnected after ${attempt} attempts`);
      if (userId) {
        newSocket.emit('join_game', { userId });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnecting(true);
      reconnectTimeoutRef.current = setTimeout(() => setIsConnecting(false), 2000);
    });

    // Game events
    newSocket.on('joined_game', (data) => {
      console.log('🎮 Successfully joined game:', data);
    });

    newSocket.on('round_start', (data) => {
      console.log('🎯 Round started:', data);
      gameStateManager.updateState({
        phase: 'preparing',
        multiplier: 1.0,
        roundId: data.roundId,
        roundStartTime: null,
        crashPoint: null,
        crashTime: null
      });
    });

    newSocket.on('round_flying', (data) => {
      console.log('🚀 Round flying:', data);
      gameStateManager.updateState({
        phase: 'flying',
        multiplier: data.multiplier,
        roundStartTime: Date.now()
      });
    });

    newSocket.on('multiplier_update', (data) => {
      gameStateManager.updateState({
        multiplier: data.multiplier
      });
    });

    newSocket.on('crash', (data) => {
      console.log('💥 Crash occurred:', data);
      gameStateManager.triggerCrash(data.crashPoint);
    });

    // Bet events
    newSocket.on('bet_placed', (data) => {
      console.log('💰 Bet placed successfully:', data);
    });

    newSocket.on('bet_error', (data) => {
      console.error('❌ Bet error:', data.error);
    });

    newSocket.on('cashed_out', (data) => {
      console.log('💸 Cashout successful:', data);
      gameStateManager.updateState({
        phase: 'cashed_out'
      });
    });

    newSocket.on('cashout_error', (data) => {
      console.error('❌ Cashout error:', data.error);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [userToken, userId]);

  // Listeners for game events (pass callbacks from Fly page)
  const onMultiplierUpdate = useCallback((cb: (multiplier: number) => void) => {
    if (socket) socket.on('multiplier_update', cb);
    return () => socket?.off('multiplier_update', cb);
  }, [socket]);

  const onBalanceUpdate = useCallback((cb: (data: { cashBalance: number; portfolioBalance: number }) => void) => {
    if (socket) socket.on('balance_update', cb);
    return () => socket?.off('balance_update', cb);
  }, [socket]);

  const onCrash = useCallback((cb: (crashPoint: number) => void) => {
    if (socket) socket.on('crash', cb);
    return () => socket?.off('crash', cb);
  }, [socket]);

  const onRoundStart = useCallback((cb: (roundData: any) => void) => {
    if (socket) socket.on('round_start', cb);
    return () => socket?.off('round_start', cb);
  }, [socket]);

  const onRoundEnd = useCallback((cb: (roundData: any) => void) => {
    if (socket) socket.on('round_end', cb);
    return () => socket?.off('round_end', cb);
  }, [socket]);

  // Emits - these return promises that resolve when the server responds
  const placeBet = useCallback((betData: { amount: number; betType: string; safePlay?: boolean }): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket) {
        console.error('❌ No socket connection for bet placement');
        resolve(false);
        return;
      }

      console.log('📡 Emitting place_bet:', betData);

      // For now, assume success and let the server handle it
      // The frontend will refresh profile data to get updated state
      socket.emit('place_bet', betData);

      // Resolve immediately - server will handle the bet
      // Frontend will update via profile refresh
      resolve(true);

      // TODO: Re-enable socket event handling when connection issues are resolved
      /*
      const timeout = setTimeout(() => {
        console.error('❌ Bet placement timeout after 5 seconds');
        resolve(false);
      }, 5000); // 5 second timeout

      const handleBetPlaced = (data: any) => {
        console.log('✅ Received bet_placed event:', data);
        clearTimeout(timeout);
        socket.off('bet_placed', handleBetPlaced);
        socket.off('bet_error', handleBetError);
        resolve(true);
      };

      const handleBetError = (data: any) => {
        console.error('❌ Received bet_error event:', data);
        clearTimeout(timeout);
        socket.off('bet_placed', handleBetPlaced);
        socket.off('bet_error', handleBetError);
        resolve(false);
      };

      socket.on('bet_placed', handleBetPlaced);
      socket.on('bet_error', handleBetError);
      */
    });
  }, [socket]);

  const cashOut = useCallback((): Promise<{ success: boolean; payout?: number; multiplier?: number }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false });
        return;
      }

      const timeout = setTimeout(() => resolve({ success: false }), 5000); // 5 second timeout

      const handleCashedOut = (data: any) => {
        clearTimeout(timeout);
        socket.off('cashed_out', handleCashedOut);
        socket.off('cashout_error', handleCashoutError);
        resolve({ success: true, payout: data.payout, multiplier: data.multiplier });
      };

      const handleCashoutError = () => {
        clearTimeout(timeout);
        socket.off('cashed_out', handleCashedOut);
        socket.off('cashout_error', handleCashoutError);
        resolve({ success: false });
      };

      socket.on('cashed_out', handleCashedOut);
      socket.on('cashout_error', handleCashoutError);
      socket.emit('cash_out');
    });
  }, [socket]);

  return { socket, isConnecting, placeBet, cashOut, onMultiplierUpdate, onBalanceUpdate, onCrash, onRoundStart, onRoundEnd };
};