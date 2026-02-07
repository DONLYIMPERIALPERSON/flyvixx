import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Bet } from './Bet';

export enum GameStatus {
  PREPARING = 'preparing',
  FLYING = 'flying',
  CRASHED = 'crashed',
  COMPLETED = 'completed'
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  crashPoint!: number;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PREPARING
  })
  status!: GameStatus;

  @Column({ type: 'timestamp' })
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  crashedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalPlayers!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBets!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPayouts!: number;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @OneToMany(() => Bet, (bet: Bet) => bet.game)
  bets!: Bet[];
}
