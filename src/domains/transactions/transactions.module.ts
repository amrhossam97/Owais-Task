import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../database/entity/user.entity";
import { TransactionsService } from "./transactions.service";
import { HttpModule } from "@nestjs/axios";
import { TransactionController } from "./transactions.controller";
import { UsersService } from "../users/users.service";
import { Transaction } from "@root/database/entity/transaction.entity";
import { Accounts } from "@root/database/entity/account.entity";
import { AccountsService } from "../accounts/account.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Accounts, Transaction]),
    HttpModule.register({
      timeout: +process.env.AXIOS_TIMEOUT,
      maxRedirects: +process.env.AXIOS_REDIRECTS,
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionsService, UsersService, AccountsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
