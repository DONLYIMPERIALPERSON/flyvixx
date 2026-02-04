// Global game state manager for bulletproof canvas rendering
export type GamePhase = 'preparing' | 'flying' | 'crashed' | 'cashed_out';

export interface GameState {
  phase: GamePhase;
  multiplier: number;
  crashPoint: number | null;
  crashTime: number | null;
  roundId: string | null;
  roundStartTime: number | null;
}

class GameStateManager {
  private state: GameState = {
    phase: 'preparing',
    multiplier: 1.0,
    crashPoint: null,
    crashTime: null,
    roundId: null,
    roundStartTime: null
  };

  private listeners: ((state: GameState) => void)[] = [];

  updateState(updates: Partial<GameState>) {
    this.state = { ...this.state, ...updates };
    // Notify all listeners immediately
    this.listeners.forEach(callback => callback(this.state));
  }

  subscribe(callback: (state: GameState) => void) {
    console.log('🎮 GameStateManager subscribe called, current listeners:', this.listeners.length);
    this.listeners.push(callback);
    console.log('🎮 GameStateManager sending initial state:', this.state);
    // Send current state immediately
    callback(this.state);
    return () => {
      console.log('🎮 GameStateManager unsubscribe called');
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  getState(): GameState {
    return this.state;
  }

  // Helper methods for common state transitions
  startRound(roundId: string, startTime: number) {
    this.updateState({
      phase: 'preparing',
      multiplier: 1.0,
      roundId,
      roundStartTime: startTime,
      crashPoint: null,
      crashTime: null
    });
  }

  startFlying() {
    this.updateState({ phase: 'flying' });
  }

  triggerCrash(crashPoint: number) {
    this.updateState({
      phase: 'crashed',
      crashPoint,
      crashTime: Date.now()
    });
  }

  showPreparing() {
    this.updateState({
      phase: 'preparing',
      crashPoint: null,
      crashTime: null
    });
  }

  resetToPreparing() {
    this.updateState({
      phase: 'preparing',
      multiplier: 1.0,
      crashPoint: null,
      crashTime: null
    });
  }
}

// Global singleton instance
export const gameStateManager = new GameStateManager();