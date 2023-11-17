import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBase64,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches
} from "class-validator";
import { Gender } from "../enums/gender.enum";
import { DateChecker } from "../helpers/DateChecker";

export const letterRegex = new RegExp("^(?=.*[a-zA-Z])"),
  specialcharRegex = new RegExp("^(?=.*[!@#\\$%\\^&\\*\\+])"),
  digitRegex = new RegExp("^(?=.*[0-9])");
export class RegisterDto {
  @ApiProperty({ required: true, type: "string", example: "User" })
  @IsNotEmpty()
  @IsString()
  userName: string;

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

  @ApiProperty({ required: true, format: "password", example: "pass@1234" })
  @IsString({ message: "Confirm Password Is Required" })
  confirmPassword: string;

  @ApiProperty({ required: true, example: "+201095047883" })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ required: false, type: "string", example: "Ismailia" })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ required: true, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ required: true, example: "21-09-1997" })
  @IsString()
  @Transform((date) => {
    return DateChecker.checkDate(date);
  })
  @IsOptional()
  birthdate: string;

  @ApiProperty({ example: "Optioanl Base64 Image" })
  @IsOptional()
  @IsBase64()
  @Transform((base64) => {
    if (base64.value == null) return null;
    switch (base64.value.slice(0, 5)) {
      case "/9j/4":
        return base64.value;
      case "iVBOR":
        return base64.value;
      case "JVBER":
        return base64.value;
      default:
        throw new BadRequestException("Please Upload Invalid Image");
    }
  })
  photo: string;
}
