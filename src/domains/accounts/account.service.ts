import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateAccountDTO, GetAccountDTO } from "@root/common/Dto/account.dto";
import { VisaType } from "@root/common/enums/visa_type.enum";
import { HandleErrorMessage } from "@root/common/exceptions/error-filter";
import {
  ACCOUNT_ALREADY_DELETED,
  ACCOUNT_NOT_EXIST,
  CARD_CVV_ERROR,
  CARD_ERROR,
  OLD_PASSWORD_ERROR,
  USER_NOT_EXIST,
} from "@root/common/messages";
import AppDataSource from "@root/config/typeorm.config";
import { Accounts } from "@root/database/entity/account.entity";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { User } from "@root/database/entity/user.entity";

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Accounts) private accountrepo: Repository<Accounts>,
    private readonly userService: UsersService,
    private httpService: HttpService
  ) {}

  async create(body: Accounts): Promise<Accounts | null> {
    const newAccount = await this.accountrepo.create(body);
    let result = await this.accountrepo.save(newAccount).catch((err) => {
      throw new BadRequestException(err.detail);
    });
    return result;
  }

  async delete(id: number) {
    if (!id) {
      return null;
    }
    let result = await this.accountrepo.delete({ id });
    return result;
  }
  public async update(
    id: number,
    newValue: Accounts
  ): Promise<Accounts | null> {
    try {
      const account = await this.accountrepo.findOne({ where: { id } });
      if (!account.id) throw new BadRequestException(ACCOUNT_NOT_EXIST);

      await this.accountrepo.save(newValue).catch((err) => {
        throw new BadRequestException({ message: err.detail });
      });

      return await this.accountrepo.findOne({ where: { id } });
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async findOne(id): Promise<Accounts | null> {
    try {
      if (!id) {
        return null;
      }
      const account = await this.accountrepo.findOne({ where: { id } });
      if (account) return account;
      return null;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async find(where: object): Promise<Accounts | null> {
    if (!where) {
      return null;
    }
    const account = await this.accountrepo.findOne({ where });

    if (account) return account;
    return null;
  }
  async getAccountsById(body: GetAccountDTO) {
    try {
      let result = await AppDataSource.createQueryBuilder(Accounts, "account")
        .select([
          "account.id",
          "account.visaType",
          "account.expiryDate",
          "account.cardNumber",
          "account.balance",
          "account.password",
        ])
        .where("account.id = :id", { id: body.accountId })
        .getOne();
      if (!result) throw new NotFoundException(ACCOUNT_NOT_EXIST);
      if (result.isDeleted)
        throw new BadRequestException(ACCOUNT_ALREADY_DELETED);
      result["hashedCardNumber"] =
        "**** **** **** " + result.cardNumber.toString().slice(12);
      let checkpassword = await User.validatePassword(
        body.password,
        result.password
      );
      if (!checkpassword) {
        throw new BadRequestException(OLD_PASSWORD_ERROR);
      }
      delete result.cardNumber;
      delete result.password;
      return result;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async findAll(where: object): Promise<Accounts[] | null> {
    if (!where) {
      return null;
    }
    const account = await this.accountrepo.find({ where });
    if (account) return account;
    return null;
  }
  async deleteAccount(id) {
    let account = await this.findOne(id);
    if (!account) throw new BadRequestException(ACCOUNT_NOT_EXIST);
    if (account.isDeleted == true)
      throw new BadRequestException(ACCOUNT_ALREADY_DELETED);
    account.isDeleted = true;
    await this.update(id, account);
    return true;
  }
  async createAccount(body: CreateAccountDTO, userId) {
    let user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException(USER_NOT_EXIST);
    if (
      body.cardNumber.toString().length != 16 ||
      body.cvv.toString().length != 3
    )
      throw new BadRequestException(CARD_CVV_ERROR);
    let foundAccount = await this.find({ cardNumber: body.cardNumber });
    if (foundAccount) throw new BadRequestException(CARD_ERROR);
    let firstNumber = String(body.cardNumber).charAt(0);
    let visaType: VisaType;
    if (firstNumber == "4") visaType = VisaType.VISA;
    else if (firstNumber == "2" || firstNumber == "5")
      visaType = VisaType.MASTERCARD;
    else throw new BadRequestException(CARD_ERROR);
    body.password = await User.hashPassword(body.password);
    let account = await this.create(
      Accounts.toEntity({ ...body, user, visaType })
    );
    return account;
  }
  async getMyAccounts(userId) {
    let user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException(USER_NOT_EXIST);
    let accounts = await AppDataSource.createQueryBuilder(Accounts, "accounts")
      .leftJoinAndSelect("accounts.user", "user")
      .where("user.id =:id AND accounts.isDeleted = false", { id: userId })
      .select([
        "accounts.id",
        "accounts.cardNumber",
        "accounts.isDeleted",
        "accounts.expiryDate",
        "accounts.visaType",
      ])
      .orderBy("accounts.id", "DESC")
      .getMany();
    if (accounts.length > 0) {
      for (let record of accounts) {
        if (record) {
          record["hashedCardNumber"] =
            "**** **** **** " + record.cardNumber.toString().slice(12);
          delete record.cardNumber;
          delete record.isDeleted;
        }
      }
    }
    return accounts;
  }
}
