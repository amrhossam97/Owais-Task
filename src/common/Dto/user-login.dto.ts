import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UserLoginDto {
  @ApiProperty({ name: 'phone', type: 'string', example: "+201095047883" })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ format: 'password' ,example:'pass@1234'})
  @IsString()
  password?: string;

}
