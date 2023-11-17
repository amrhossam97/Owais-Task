import { Gender } from "@root/common/enums/gender.enum";
import * as bcrypt from "bcrypt";
import { classToPlain, plainToClass } from "class-transformer";
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Accounts } from "./account.entity";
import { Transaction } from "./transaction.entity";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @Column({ type: "text", nullable: false })
  userName: string;

  @Column({ type: "varchar", length: 20, nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: "varchar", length: 300 })
  password: string;

  @Column({ type: "varchar", default: null })
  access_token: string;

  @Column({ type: "text", default: null })
  photo: string;

  @Column({ type: "text", default: null })
  address: string;

  @Column({ type: "varchar", default: null })
  birthdate: string;

  @Column({ type: "varchar", length: 20, nullable: true , default: null })
  temp_phone: string;

  // ENUM
  @Column({
    type: "enum",
    enum: Gender,
    default: Gender.MALE,
  })
  gender: Gender;

  //verifying
  @Column({ type: "boolean", default: false })
  isverify: boolean;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;
  //Verify Code
  @Column({ type: "integer", default: null })
  smscode: number;

  //Reset Password Code
  @Column({ type: "integer", default: null })
  reset_code: number;

  @OneToMany(() => Accounts, (account) => account.user, {})
  accounts: Accounts[];

  @OneToMany(() => Transaction, (transactions) => transactions.user, {})
  transactions: Transaction[];

  static async hashPassword(pass: string) {
    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(pass, salt);
    return hash;
  }
  static async validatePassword(
    password: string,
    hashedPass: string
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPass);

    return isMatch;
  }
  async markPhoneNumberAsConfirmed(code: any): Promise<boolean> {
    if (this.smscode == code) {
      this.isverify = true;
      this.smscode = null;
      return true;
    }
    return false;
  }

  static toEntity(DtoObject): User {
    const data = classToPlain(DtoObject);
    return plainToClass(User, data);
  }
}
