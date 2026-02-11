import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('crypto_rates')
@Index(['symbol', 'timestamp'])
export class CryptoRate {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    @Index()
    symbol!: string;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    price!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
