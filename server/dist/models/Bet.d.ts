import 'reflect-metadata';
import { User } from './User';
import { Game } from './Game';
export declare enum BetStatus {
    ACTIVE = "active",
    CASHED_OUT = "cashed_out",
    LOST = "lost"
}
export declare class Bet {
    id: string;
    userId: string;
    gameId: string;
    amount: number;
    cashedOutAt?: number;
    payout: number;
    status: BetStatus;
    cashedOutAtTime?: Date;
    createdAt: Date;
    user: User;
    game: Game;
}
//# sourceMappingURL=Bet.d.ts.map