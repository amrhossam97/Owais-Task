import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../database/entity/user.entity";
import { AccountsService } from "./account.service";
import { HttpModule } from "@nestjs/axios";
import { AccountController } from "./account.controller";
import { Accounts } from "@root/database/entity/account.entity";
import { UsersService } from "../users/users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Accounts]),
    HttpModule.register({
      timeout: +process.env.AXIOS_TIMEOUT,
      maxRedirects: +process.env.AXIOS_REDIRECTS,
    }),
  ],
  controllers: [AccountController],
  providers: [AccountsService , UsersService],
  exports: [AccountsService],
})
export class AccountsModule {}
