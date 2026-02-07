import { Bet } from './Bet';
export declare enum GameStatus {
    PREPARING = "preparing",
    FLYING = "flying",
    CRASHED = "crashed",
    COMPLETED = "completed"
}
export declare class Game {
    id: string;
    crashPoint: number;
    status: GameStatus;
    startedAt: Date;
    crashedAt?: Date;
    totalPlayers: number;
    totalBets: number;
    totalPayouts: number;
    createdAt: Date;
    bets: Bet[];
}
//# sourceMappingURL=Game.d.ts.map