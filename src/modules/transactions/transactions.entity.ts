import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column()
  address: string;

  @Column()
  from: string;

  @Column()
  type: string; // withdraw - deposit

  @Column()
  amount: number;

  @Column()
  createdAt: number;

  @Column()
  tokenId: number;

  @Column()
  timestamp: number;

  @Index({ unique: true })
  @Column()
  txHash: string;

  @Column({ default: 0 })
  launchpadId: number;

  @Column({ default: false })
  isOwnerCreated: boolean;

  @BeforeInsert()
  nameToUpperCase() {
    this.address = this.address.toLowerCase();
  }

  @BeforeInsert()
  updateDates() {
    if (!this.timestamp) {
      this.timestamp = new Date().getTime();
    }
    this.createdAt = new Date().getTime();
  }

  constructor(transaction?: Partial<Transaction>) {
    Object.assign(this, transaction);
  }
}
