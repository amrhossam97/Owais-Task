import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";
import { letterRegex, specialcharRegex, digitRegex } from "./register.dto";

export class ChangePasswordDTO {
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
  newPassword: string;

  @ApiProperty({ example: "pass@1234" })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: "pass@1234" })
  @IsString()
  oldPassword: string;
}
