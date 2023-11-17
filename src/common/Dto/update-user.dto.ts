import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBase64, IsPhoneNumber } from "class-validator";

export class UpdateUserDTO {
    @ApiProperty({ required: true, example: '+201095047883' })
    @IsPhoneNumber()
    phoneNumber: string;
}
export class ProfileImageDTO{
    @ApiProperty({ example: "Base64 Image" })
    @IsBase64()
    @Transform((base64) => {
      if (base64.value == null) throw new BadRequestException("Please Upload Invalid Image");
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