import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Bet } from './Bet';
import { Transaction } from './Transaction';
import { Notification } from './Notification';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

@Entity('users')
export class User {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'json', nullable: true })
  payoutDetails?: {
    btc?: {
      btcAddress?: string;
    };
    usdt?: {
      usdtAddress?: string;
    };
    bank?: {
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      nameEnquiryReference?: string;
    };
  };

  @Column()
  passwordHash!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cashBalance!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  portfolioBalance!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lockedFunds!: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status!: UserStatus;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ unique: true, nullable: true })
  referralCode?: string;

  @Column({ nullable: true })
  referredBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Bet, (bet: Bet) => bet.user)
  bets!: Bet[];

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.user)
  transactions!: Transaction[];

  @OneToMany(() => Notification, (notification: Notification) => notification.user)
  notifications!: Notification[];
}

  