import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString, Length, Matches } from "class-validator";
import { TransactionType } from "../enums/transaction_type.enum";
import { letterRegex, specialcharRegex, digitRegex } from "./register.dto";

export class CreateTransactionDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  fromAccountId: number;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNumber()
  toCardNumber: number;

  @ApiProperty({ example: 200.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: true, format: "password", example: "pass@1234" })
  @IsString({ message: "Passwrod Is Required" })
  @Length(8, 50, {
    message: "Weak Password! Please make sure it 8 character long or more",
  })
  @Matches(letterRegex, {
    message: "Weak Password! Please make sure it contains at least one letter",
  })
  @Matches(specialcharRegex, {
    message:
      "Weak Password! Please make sure it contains at least one special character",
  })
  @Matches(digitRegex, {
    message: "Weak Password! Please provid at least one digit",
  })
  password: string;

  @ApiProperty({
    required: true,
    example: `${TransactionType.DEPOSIT}||${TransactionType.TRANSFER}||${TransactionType.WITHDRAWAL}`,
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;
}
export class GetTransactionDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  TransactionId: number;
}
