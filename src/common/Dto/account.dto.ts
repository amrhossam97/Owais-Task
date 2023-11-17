import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNumber,
  IsString,
  Length,
  Matches
} from "class-validator";
import { DateChecker } from "../helpers/DateChecker";
import { digitRegex, letterRegex, specialcharRegex } from "./register.dto";

export class DelteAccountDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  accountId: number;
}
export class CreateAccountDTO {
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

  @ApiProperty({ example: 5234567890123456 })
  @IsNumber()
  cardNumber: number;

  @ApiProperty({ example: 123 })
  @IsNumber()
  cvv: number;

  @ApiProperty({ example: 10.5 })
  @IsNumber()
  balance: number;

  @ApiProperty({ required: true, example: "25-09" })
  @IsString()
  @Transform((date) => {
    return DateChecker.checkExpiryDate(date);
  })
  expiryDate: string;
}
export class GetAccountDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  accountId: number;

  @ApiProperty({ format: 'password' ,example:'pass@1234'})
  @IsString()
  password?: string;

}
