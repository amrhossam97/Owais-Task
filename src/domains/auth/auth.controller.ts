import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ForgetPasswordDTO } from "@root/common/Dto/forgetpassword.dto";
import { NewPasswordDTO } from "@root/common/Dto/newPassword.dto";
import { RegisterDto } from "@root/common/Dto/register.dto";
import { UserLoginDto } from "@root/common/Dto/user-login.dto";
import { ResendCodeDTO, VerifyDTO } from "@root/common/Dto/verify.dto";
import { User } from "@root/common/decorateros/user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import * as message from "../../common/messages";
import { AuthService } from "./auth.service";
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags("Auth")
  @ApiOperation({
    description: "The user should be able to login if the account is verified",
  })
  @Post("/login")
  async login(@Body() body: UserLoginDto) {
    const result = await this.authService.login(body);
    return { message: "You Logged in Successfully", result };
  }

  @Post("/register")
  @ApiOperation({
    description: "The user should be able to register his account",
  })
  @ApiTags("Auth")
  async register(@Body() body: RegisterDto) {
    const result = await this.authService.signUp(body);
    return { message: "You Registered in Successfully", data: result };
  }

  @Post("/confirmVerify")
  @ApiTags("Auth")
  @ApiOperation({
    description:
      "The user should be able to verify his account by providing the sms code and user id .",
  })
  async confirmVerify(@Body() body: VerifyDTO) {
    const result = await this.authService.confirmVerifing(
      body.userId,
      body.code
    );
    return { message: "account verified", result };
  }
  @Post("/forgetPassword")
  @ApiTags("Auth")
  @ApiOperation({
    description:
      "Send Code to the user phone to be able to change his password.",
  })
  async forgetPassword(@Body() body: ForgetPasswordDTO) {
    let result = await this.authService.forgetPassword(body.phoneNumber);
    return { message: "code sent successfully", result };
  }

  @Post("/changePassword")
  @ApiTags("Auth")
  @ApiOperation({
    description:
      "The user should be able to change password by providing the code and the new password and userId.",
  })
  async newPassword(@Body() body: NewPasswordDTO) {
    await this.authService.newPassword(body);
    return { message: "password changed successfully" };
  }

  @Post("/resendSMS")
  @ApiTags("Auth")
  @ApiOperation({ description: "Resend verify code or forget code to user's." })
  async resendSMS(@Body() body: ResendCodeDTO) {
    await this.authService.resendSMS(body);
    return { message: "code sent successfully" };
  }

  @ApiTags("Auth")
  @Get("/logOut")
  @ApiOperation({ description: "The user should be able to logout." })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async Logout(@User() user) {
    let result = await this.authService.logout(user.userId);

    return { message: message.LOGOUT_SUCCESS, result };
  }
}
