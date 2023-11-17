import { Body, Controller, Delete, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  CreateTransactionDTO,
  GetTransactionDTO,
} from "@root/common/Dto/transaction.dto";
import { JwtAuthGuard } from "@root/common/guards/jwt-auth.guard";
import { User } from "../../common/decorateros/user.decorator";
import { TransactionsService } from "./transactions.service";
import AppDataSource from "@root/config/typeorm.config";

@Controller("/transaction")
export class TransactionController {
  constructor(private TransactionService: TransactionsService) {}

  @ApiTags("Transaction")
  @Post("/createTransaction")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async createTransaction(@Body() body: CreateTransactionDTO, @User() user) {
    const result = await AppDataSource.transaction(async (manager) => {
      return await this.TransactionService.createTransaction(
        body,
        user.userId,
        manager
      );
    });
    return { message: "Transaction Created Successfully" ,result};
  }

  @ApiTags("Transaction")
  @Post("/getTransactionsById")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async getTransactionsById(@Body() body: GetTransactionDTO) {
    const result = await this.TransactionService.getTransactionsById(body);
    return { message: "Transaction Returned Successfully", result };
  }

  @ApiTags("Transaction")
  @Get("/getMyTransactions")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@User() user) {
    const result = await this.TransactionService.getMyTransactions(user.userId);
    return { message: "Transaction Returned Successfully", result };
  }
}
