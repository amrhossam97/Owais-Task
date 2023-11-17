import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Decription } from '@root/common/encription/decription';
import { UsersService } from '@root/domains/users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService:UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: `${process.env.IGNORE_JWT_EXPIRE}`,
      secretOrKey: `${process.env.JWT_SECRET_KEY}`,
    });
  }

  async validate(payload: any) {
    try {
      //#decrept
      const iv = process.env.ENCRIPT_IV;
      const password = process.env.ENCRIPT_KEY;
      const userId =Decription(payload.userId, password, iv)
      let user = await this.userService.findOne(userId)
      if(!user || user.access_token == null) throw new UnauthorizedException()
      return {
        userId,
        userName: Decription(payload.userName, password, iv),
        userPhone: Decription(payload.userPhone, password, iv),
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
