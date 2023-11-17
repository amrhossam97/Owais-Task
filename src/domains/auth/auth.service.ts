import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NewPasswordDTO } from "@root/common/Dto/newPassword.dto";
import { RegisterDto } from "@root/common/Dto/register.dto";
import { UserLoginDto } from "@root/common/Dto/user-login.dto";
import { ResendCodeDTO } from "@root/common/Dto/verify.dto";
import { Encript } from "@root/common/encription/encription";
import { HandleErrorMessage } from "@root/common/exceptions/error-filter";
import {
  CODE_ERROR,
  LOGIN_ERROR,
  PASSWORD_ERROR,
  TYPE_ERROR,
  USER_ALREADY_VERIFIED,
  USER_DELETED,
  USER_NOT_EXIST,
  VERIFIED_ERROR,
} from "@root/common/messages";
import { User } from "../../database/entity/user.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.find({ phoneNumber: phone });

    if (!user) {
      throw new BadRequestException(USER_NOT_EXIST);
    }
    const validPassword = await User.validatePassword(password, user.password);

    if (user && validPassword) {
      const { password, ...result } = user;
      return result;
    }
    return false;
  }
  async logout(id: number) {
    try {
      let user = await this.usersService.findOne(id);      
      if (user === null) throw new BadRequestException(USER_NOT_EXIST);
      user.access_token = null;
      await this.usersService.update(id, user);
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async login(body: UserLoginDto) {
    try {
      let user: User;
      user = await this.validateUser(body.phone, body.password);
      if (!user) {
        throw new BadRequestException(LOGIN_ERROR);
      }

      if (user.isverify == false) {
        throw new BadRequestException(VERIFIED_ERROR);
      }
      if (user.isDeleted == true) {
        throw new BadRequestException(USER_DELETED);
      }

      // #Encrypt
      const iv = process.env.ENCRIPT_IV;
      const password = process.env.ENCRIPT_KEY;
      const payload = {
        userName: Encript(user.userName, password, iv),
        userPhone: Encript(user.phoneNumber, password, iv),
        userId: Encript(user.id + "", password, iv),
      };
      const access_token = this.jwtService.sign(payload);
      user.access_token = access_token;
      await this.usersService.update(user.id, user);
      // #Handle

      return {
        access_token,
        userId: user.id,
        userName: user.userName,
        photo: user.photo,
      };
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async signUp(body: RegisterDto) {
    try {
      if (body.password != body.confirmPassword)
        throw new BadRequestException(PASSWORD_ERROR);
      let userPhone = await this.usersService.find({
        phoneNumber: body.phoneNumber,
      });
      if (userPhone) throw new BadRequestException();
      const user = User.toEntity(body);
      user.smscode = Math.floor(1000 + Math.random() * 9000);
      // Send Verification SMS
      // Make The Code is Static 2222 For Testing
      user.smscode = 2222;
      user.password = await User.hashPassword(body.password);
      let result = await this.usersService.create(user);
      return { id: result.id };
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async confirmVerifing(userid: number, code: number): Promise<boolean> {
    try {
      const user = await this.usersService.find({ id: userid });
      if (!user) throw new BadRequestException(USER_NOT_EXIST);
      if (user.isverify == true)
        throw new BadRequestException(USER_ALREADY_VERIFIED);
      const result = await user.markPhoneNumberAsConfirmed(code);
      if (result) await this.usersService.update(user.id, user);
      if (!result) {
        throw new BadRequestException(CODE_ERROR);
      }
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async forgetPassword(phoneNumber: string) {
    try {
      let user = await this.usersService.find({ phoneNumber });
      if (user === null) throw new BadRequestException(USER_NOT_EXIST);
      if (!user.isverify) throw new BadRequestException(VERIFIED_ERROR);
      user.reset_code = Math.floor(1000 + Math.random() * 9000);
      // Send SMS Code
      // Make The Code is Static 2222 For Testing
      user.reset_code = 2222;
      await this.usersService.update(user.id, user);
      return user.id;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async newPassword(body: NewPasswordDTO) {
    try {
      let user = await this.usersService.find({
        reset_code: body.code,
        id: body.userId,
      });
      if (user === null) throw new BadRequestException(USER_NOT_EXIST);
      if (body.password != body.confirmPassword)
        throw new BadRequestException(PASSWORD_ERROR);
      user.password = await User.hashPassword(body.password);
      user.reset_code = null;
      await this.usersService.update(user.id, user);
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async resendSMS(body: ResendCodeDTO) {
    try {
      let user = await this.usersService.find({ id: body.userId });
      if (!user) throw new BadRequestException(USER_NOT_EXIST);
      if (body.type == "forget") await this.forgetPassword(user.phoneNumber);
      else if (body.type == "verify") {
        if (user.isverify == true)
          throw new BadRequestException(USER_ALREADY_VERIFIED);
        user.smscode = Math.floor(1000 + Math.random() * 9000);
        // Make The Code is Static 2222 For Testing
        user.smscode = 2222;
      } else throw new BadRequestException(TYPE_ERROR);
      return user.id;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
}
