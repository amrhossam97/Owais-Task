import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber } from "class-validator";

export class ForgetPasswordDTO{

    @ApiProperty({example:"+201095047883"})
    @IsPhoneNumber()
    phoneNumber:string;

}
