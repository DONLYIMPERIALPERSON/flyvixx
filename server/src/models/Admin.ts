import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdminStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

@Entity('admins')
export class Admin {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({
    type: 'enum',
    enum: AdminStatus,
    default: AdminStatus.ACTIVE
  })
  status!: AdminStatus;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ type: 'json', nullable: true })
  payoutDetails?: {
    bank?: {
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      nameEnquiryReference?: string;
    };
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}