import { TransactionStatus } from "@root/common/enums/transaction_status.enum";
import { TransactionType } from "@root/common/enums/transaction_type.enum";
import { classToPlain, plainToClass } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity({ name: "transactions" })
export class Transaction extends BaseEntity {
  @Column({ type: "integer", nullable: false })
  fromAccount: number;

  @Column({ type: "integer", nullable: true })
  toAccount: number;

  @Column({ type: "numeric", nullable: false , default: 0 })
  amount: number;

  @Column({ type: "varchar", nullable: false, length: 100 })
  merchantReferenceId: string;

  // ENUM
  @Column({
    type: "enum",
    enum: TransactionType,
    default: TransactionType.DEPOSIT,
  })
  type: TransactionType;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ManyToOne(() => User , (user)=>user.transactions)
  @JoinColumn()
  user: User;
  

  static toEntity(DtoObject): Transaction {
    const data = classToPlain(DtoObject);
    return plainToClass(Transaction, data);
  }
}
