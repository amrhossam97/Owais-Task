import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class VerifyDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 2222 })
  @IsNumber()
  code: number;
}

export class ResendCodeDTO {
    @ApiProperty({ example: 1 })
    @IsNumber()
    userId: number;

    @ApiProperty({ example: 'verify || forget' })
    @IsString()
    type: string;
}
export class VerifyPhoneNumber {
    @ApiProperty({ example: 2222 })
    @IsNumber()
    code:number
}
