import { VisaType } from "@root/common/enums/visa_type.enum";
import { classToPlain, plainToClass } from "class-transformer";
import { Check, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";


@Entity({ name: "accounts" })
@Check(`"balance" > 0`)
export class Accounts extends BaseEntity {
  @Column({ type: "bigint", nullable: false, unique: true })
  cardNumber: number;

  @Column({ type: "numeric", nullable: false , default: 0 })
  balance: number;

  @Column({ type: "varchar", length: 300 })
  password: string;

  @Column({ type: "integer", nullable: false })
  cvv: number;

  @Column({ type: "varchar", nullable: false })
  expiryDate: string;

  // ENUM
  @Column({
    type: "enum",
    enum: VisaType,
    default: VisaType.VISA,
  })
  visaType: VisaType;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @ManyToOne(() => User , (user)=>user.accounts)
  @JoinColumn()
  user: User;
  

  static toEntity(DtoObject): Accounts {
    const data = classToPlain(DtoObject);
    return plainToClass(Accounts, data);
  }
}
