import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDTO } from "@root/common/Dto/change-password.dto";
import {
  ProfileImageDTO,
  UpdateUserDTO,
} from "@root/common/Dto/update-user.dto";
import { VerifyPhoneNumber } from "@root/common/Dto/verify.dto";
import { JwtAuthGuard } from "@root/common/guards/jwt-auth.guard";
import { User } from "../../common/decorateros/user.decorator";
import { UsersService } from "./users.service";

@Controller("/user")
export class UserController {
  constructor(private userservice: UsersService) {}

  @ApiTags("User")
  @Get("/getUserProfile")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({})
  async getUserProfile(@User() user) {
    let result = await this.userservice.getUserById(user.userId);
    return { result, message: "User Profile Returned Successfully" };
  }

  @ApiTags("User")
  @Post("/updateProfileImage")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async updateProfileImage(@User() user, @Body() body: ProfileImageDTO) {
    let result = await this.userservice.updateProfileImage(
      user.userId,
      body.photo
    );

    return { message: "User Photo Updated Successfully", result };
  }

  @ApiTags("User")
  @Post("/updateUserInfo")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async updateUserInfo(@User() user, @Body() body: UpdateUserDTO) {
    let result = await this.userservice.updateUser(user.userId, body);
    return { message: "Code Sent Successfully", result };
  }

  @ApiTags("User")
  @Put("/changePasswrod")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async changePasswrod(@User() user, @Body() body: ChangePasswordDTO) {
    if (body.newPassword != body.confirmPassword)
      throw new BadRequestException(
        "Password and Confirm Password Does Not Match"
      );
    let result = await this.userservice.changePassword(user.userId, body);
    return { message: "Password Changed Successfully", result };
  }

  @ApiTags("User")
  @Put("/verifyPhone")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async verifyPhone(@User() user, @Body() body: VerifyPhoneNumber) {
    let result = await this.userservice.verifyChangePhoneNumber(
      user.userId,
      body
    );
    return { message: "Phone Changed Successfully", result };
  }
  @ApiTags("User")
  @Put("/resendSMS")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async resendSMS(@User() user) {
    let result = await this.userservice.resendCode(user.userId);
    return { message: "Code Sent Successfully", result };
  }

  @ApiTags("User")
  @Delete("/deleteUser")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async deleteUser(@User() user) {
    const result = await this.userservice.deleteAccount(user.userId);
    return { message: "User Deleted Successfully" };
  }
}
