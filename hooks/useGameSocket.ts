import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { gameStateManager } from '../components/game-state-manager';

// Per-player game simulation - each player has their own game instance
class PerPlayerGame {
  private listeners: { [event: string]: ((data: any) => void)[] } = {};
  private multiplierInterval: NodeJS.Timeout | null = null;
  private preparingTimeout: NodeJS.Timeout | null = null;
  private crashTimeout: NodeJS.Timeout | null = null;

  private readonly preparingDuration = 3000; // 3 seconds preparing
  private readonly crashDisplayDuration = 3000; // 3 seconds crash display
  private readonly updateInterval = 50; // 50ms updates

  constructor() {
    // Start in preparing state
    this.startPreparing();
  }

  private startPreparing() {
    console.log('🎮 Starting preparing phase');

    gameStateManager.updateState({
      phase: 'preparing',
      multiplier: 1.0,
      roundId: null,
      roundStartTime: null,
      crashPoint: null,
      crashTime: null
    });

    // After preparing, start flying
    this.preparingTimeout = setTimeout(() => {
      this.startFlying();
    }, this.preparingDuration);
  }

  private startFlying() {
    console.log('🎮 Starting flying phase');

    const roundId = `player_round_${Date.now()}`;
    const roundStartTime = Date.now();

    gameStateManager.updateState({
      phase: 'flying',
      roundId,
      roundStartTime,
      multiplier: 1.0,
      crashPoint: null,
      crashTime: null
    });

    // Start multiplier updates
    this.startMultiplierUpdates(roundId, roundStartTime);
  }

  private startMultiplierUpdates(roundId: string, roundStartTime: number) {
    // Clear any existing updates
    if (this.multiplierInterval) {
      clearInterval(this.multiplierInterval);
    }

    // Generate crash point once at the start of the round
    const crashPoint = this.getPlayerCrashPoint(roundId);
    console.log(`🎯 Round ${roundId} crash point: ${crashPoint.toFixed(2)}x`);

    this.multiplierInterval = setInterval(() => {
      const now = Date.now();
      const timeIntoRound = now - roundStartTime;

      // Calculate multiplier (starts at 1.00, grows at 0.05x per second)
      const multiplier = 1.00 + (timeIntoRound / 1000) * 0.05;

      // Check for crash with precise timing
      if (multiplier >= crashPoint) {
        console.log(`💥 Player crash at ${crashPoint.toFixed(2)}x (actual: ${multiplier.toFixed(2)}x)`);
        this.handleCrash(crashPoint);
        return;
      }

      // Update multiplier directly - no throttling needed
      gameStateManager.updateState({ multiplier });
    }, 100); // Simple 100ms updates for smooth counting
  }

  private handleCrash(crashPoint: number) {
    // Stop multiplier updates
    if (this.multiplierInterval) {
      clearInterval(this.multiplierInterval);
      this.multiplierInterval = null;
    }

    // Trigger crash
    gameStateManager.triggerCrash(crashPoint);

    // After crash display, go back to preparing
    this.crashTimeout = setTimeout(() => {
      this.startPreparing();
    }, this.crashDisplayDuration);
  }

  private getPlayerCrashPoint(roundId: string): number {
    // Generate a random crash point for this player (different for each round)
    const seed = roundId.split('_')[2] || Date.now().toString();
    const hash = parseInt(seed) % 1000;
    const normalized = hash / 1000;

    // Crash between 1.5x and 4.0x
    return 1.5 + (normalized * 2.5);
  }

  // Manual cashout (when player clicks stop)
  cashOut() {
    // Don't stop the multiplier updates - let the round continue for other players
    // Just change phase to show cashed out state

    // Update state to show cashed out (freeze multiplier at current value)
    gameStateManager.updateState({
      phase: 'cashed_out', // New phase for cashed out state
    });

    // After showing cashed out message, go back to preparing for next round
    setTimeout(() => {
      // Stop the multiplier updates now
      if (this.multiplierInterval) {
        clearInterval(this.multiplierInterval);
        this.multiplierInterval = null;
      }
      this.startPreparing();
    }, 2000); // 2 seconds to show cashed out message
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.multiplierInterval) clearInterval(this.multiplierInterval);
    if (this.preparingTimeout) clearTimeout(this.preparingTimeout);
    if (this.crashTimeout) clearTimeout(this.crashTimeout);
  }
}

export const useGameSocket = (userToken?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const perPlayerGameRef = useRef<PerPlayerGame | null>(null);

  useEffect(() => {
    // Try to connect to real server first
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    // For development/demo purposes, use per-player game if real server not available
    const usePerPlayerGame = !backendUrl || backendUrl.includes('localhost') || process.env.NODE_ENV === 'development';

    if (usePerPlayerGame) {
      console.log('🎮 Using per-player game simulation');
      setIsConnecting(true);

      // Simulate connection delay
      setTimeout(() => {
        setIsConnecting(false);
        const perPlayerGame = new PerPlayerGame();
        perPlayerGameRef.current = perPlayerGame;

        // Create a mock socket-like interface
        const mockSocket = {
          on: (event: string, callback: (data: any) => void) => perPlayerGame.on(event, callback),
          off: (event: string, callback: (data: any) => void) => perPlayerGame.off(event, callback),
          emit: (event: string, data?: any) => {
            console.log('Mock emit:', event, data);
            // Handle cashout manually
            if (event === 'cash_out') {
              perPlayerGame.cashOut();
            }
          },
          disconnect: () => perPlayerGame.disconnect(),
          close: () => perPlayerGame.disconnect()
        };

        setSocket(mockSocket as any);
      }, 1000);

      return () => {
        if (perPlayerGameRef.current) {
          perPlayerGameRef.current.disconnect();
        }
      };
    }

    // Real server connection (unchanged)
    const newSocket = io(backendUrl, {
      auth: { token: userToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnecting(false);
      newSocket.emit('join_round', { userId: 'your-user-id' });
      heartbeatRef.current = setInterval(() => newSocket.emit('heartbeat'), 30000);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      clearInterval(heartbeatRef.current!);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      newSocket.emit('join_round');
    });

    newSocket.on('connect_error', () => {
      setIsConnecting(true);
      reconnectTimeoutRef.current = setTimeout(() => setIsConnecting(false), 2000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [userToken]);

  // Listeners for game events (pass callbacks from Fly page)
  const onMultiplierUpdate = useCallback((cb: (multiplier: number) => void) => {
    if (socket) socket.on('multiplier_update', cb);
    return () => socket?.off('multiplier_update', cb);
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

  // Emits
  const placeBet = useCallback((betData: any) => socket?.emit('place_bet', betData), [socket]);
  const cashOut = useCallback(() => socket?.emit('cash_out'), [socket]);

  return { socket, isConnecting, placeBet, cashOut, onMultiplierUpdate, onCrash, onRoundStart, onRoundEnd };
};