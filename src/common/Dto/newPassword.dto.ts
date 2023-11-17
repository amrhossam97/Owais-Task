import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Length, Matches } from "class-validator";
import { digitRegex, letterRegex, specialcharRegex } from "./register.dto";

export class NewPasswordDTO {
  @ApiProperty({ example: 2222 })
  @IsNumber()
  code: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

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

  @ApiProperty({ example: "pass@1234" })
  @IsString()
  confirmPassword: string;
}
