import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateAccountDTO, DelteAccountDTO, GetAccountDTO } from "@root/common/Dto/account.dto";
import { JwtAuthGuard } from "@root/common/guards/jwt-auth.guard";
import { User } from "../../common/decorateros/user.decorator";
import { AccountsService } from "./account.service";

@Controller("/account")
export class AccountController {
  constructor(private accountService: AccountsService) {}

  @ApiTags("Account")
  @Post("/createAccount")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async createAccount(@Body() body:CreateAccountDTO,@User() user) {
    const result = await this.accountService.createAccount(body,user.userId);
    return { message: "Account Created Successfully" };
  }

  @ApiTags("Account")
  @Post("/getAccountBalance")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async getAccountBalance(@Body() body:GetAccountDTO) {
    const result = await this.accountService.getAccountsById(body);
    return { message: "Account Returned Successfully" ,result};
  }

  @ApiTags("Account")
  @Get("/getMyAccounts")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async getMyAccounts(@User() user) {
    const result = await this.accountService.getMyAccounts(user.userId);
    return { message: "Account Returned Successfully", result };
  }

  @ApiTags("Account")
  @Delete("/deleteAccount")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Body() body:DelteAccountDTO) {
    const result = await this.accountService.deleteAccount(body.accountId);
    return { message: "Account Deleted Successfully" };
  }
}
