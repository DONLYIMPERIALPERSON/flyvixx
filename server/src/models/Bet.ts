import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Game } from './Game';

export enum BetStatus {
  ACTIVE = 'active',
  CASHED_OUT = 'cashed_out',
  LOST = 'lost'
}

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  gameId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cashedOutAt?: number; // Multiplier when cashed out

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  payout!: number;

  @Column({
    type: 'enum',
    enum: BetStatus,
    default: BetStatus.ACTIVE
  })
  status!: BetStatus;

  @Column({ type: 'timestamp', nullable: true })
  cashedOutAtTime?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User, (user: User) => user.bets)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Game, (game: Game) => game.bets)
  @JoinColumn({ name: 'gameId' })
  game!: Game;
}
