import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  CreateTransactionDTO,
  GetTransactionDTO,
} from "@root/common/Dto/transaction.dto";
import { TransactionStatus } from "@root/common/enums/transaction_status.enum";
import { TransactionType } from "@root/common/enums/transaction_type.enum";
import { HandleErrorMessage } from "@root/common/exceptions/error-filter";
import {
  ACCOUNT_NOT_EXIST,
  OLD_PASSWORD_ERROR,
  Transaction_NOT_EXIST,
  USER_NOT_EXIST,
} from "@root/common/messages";
import AppDataSource from "@root/config/typeorm.config";
import { Transaction } from "@root/database/entity/transaction.entity";
import { Accounts } from "@root/database/entity/account.entity";
import { User } from "@root/database/entity/user.entity";
import { EntityManager, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AccountsService } from "../accounts/account.service";
import { UsersService } from "../users/users.service";
import { DateChecker } from "@root/common/helpers/DateChecker";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private Transactionrepo: Repository<Transaction>,
    private readonly userService: UsersService,
    private readonly accountService: AccountsService,
    private httpService: HttpService
  ) {}

  async create(body: Transaction): Promise<Transaction | null> {
    const transaction = await this.Transactionrepo.create(body);
    let result = await this.Transactionrepo.save(transaction).catch((err) => {
      throw new BadRequestException(err.detail);
    });
    return result;
  }

  async delete(id: number) {
    if (!id) {
      return null;
    }
    let result = await this.Transactionrepo.delete({ id });
    return result;
  }
  public async update(
    id: number,
    newValue: Transaction
  ): Promise<Transaction | null> {
    try {
      const Transaction = await this.Transactionrepo.findOne({ where: { id } });
      if (!Transaction.id) throw new BadRequestException(Transaction_NOT_EXIST);

      await this.Transactionrepo.save(newValue).catch((err) => {
        throw new BadRequestException({ message: err.detail });
      });

      return await this.Transactionrepo.findOne({ where: { id } });
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async findOne(id): Promise<Transaction | null> {
    try {
      if (!id) {
        return null;
      }
      const Transaction = await this.Transactionrepo.findOne({ where: { id } });
      if (Transaction) return Transaction;
      return null;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async find(where: object): Promise<Transaction | null> {
    if (!where) {
      return null;
    }
    const Transaction = await this.Transactionrepo.findOne({ where });

    if (Transaction) return Transaction;
    return null;
  }
  async getTransactionsById(body: GetTransactionDTO) {
    try {
      let result = await AppDataSource.createQueryBuilder(
        Transaction,
        "transaction"
      )
        .select([
          "transaction.id",
          "transaction.fromAccount",
          "transaction.toAccount",
          "transaction.merchantReferenceId",
          "transaction.type",
          "transaction.status",
        ])
        .where("transaction.id = :id", { id: body.TransactionId })
        .getOne();
      if (!result) throw new NotFoundException(Transaction_NOT_EXIST);
      let fromAccount = await this.accountService.findOne(result.fromAccount),
        toAccount = await this.accountService.findOne(result.toAccount);
      if (
        !fromAccount ||
        (!toAccount && result.type == TransactionType.TRANSFER)
      )
        throw new BadRequestException("Please Contact Support");
      result["fromAccountDetails"] = fromAccount;
      result["toAccountDetails"] = toAccount;
      delete result.fromAccount;
      delete result.toAccount;
      return result;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async findAll(where: object): Promise<Transaction[] | null> {
    if (!where) {
      return null;
    }
    const Transaction = await this.Transactionrepo.find({ where });
    if (Transaction) return Transaction;
    return null;
  }
  async createTransaction(
    body: CreateTransactionDTO,
    userId,
    manager: EntityManager
  ) {
    const UserRepo = manager.getRepository(User);
    const AccountRepo = manager.getRepository(Accounts);
    const TransactionRepo = manager.getRepository(Transaction);
    let user = await UserRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(USER_NOT_EXIST);
    let fromAccount = await AccountRepo.findOne({
      where: { id: body.fromAccountId, isDeleted: false },
      relations: ["user"],
    });
    if (!fromAccount) throw new NotFoundException(ACCOUNT_NOT_EXIST);
    let checkExpiryDate = DateChecker.checkExpiryDate({
      value: fromAccount.expiryDate,
    });

    if (checkExpiryDate == null)
      throw new BadRequestException("Expired Card Please Chose Another Card");
    if (
      body.transactionType == TransactionType.TRANSFER &&
      body.toCardNumber == null
    )
      throw new BadRequestException("Please Chose Account For The Transfer");
    if (user.id != fromAccount.user.id)
      throw new BadRequestException(
        "You Can Only Able To Make Transaction On Your Accounts"
      );
    // Balance Check
    if (
      body.transactionType == TransactionType.WITHDRAWAL ||
      body.transactionType == TransactionType.TRANSFER
    ) {
      if (body.amount > fromAccount.balance)
        throw new BadRequestException("Wrong Amount Please Check Your Balance");
    }
    let passwordCheck = await User.validatePassword(
      body.password,
      fromAccount.password
    );
    if (!passwordCheck) throw new BadRequestException(OLD_PASSWORD_ERROR);
    let toAccount: Accounts;
    if (body.transactionType == TransactionType.TRANSFER) {
      toAccount = await AccountRepo.findOne({
        where: { cardNumber: body.toCardNumber, isDeleted: false },
        relations: ["user"],
      });
      if (!toAccount) throw new BadRequestException("Wrong Card Number");
    }
    try {
      let transaction = TransactionRepo.create({
        amount: body.amount,
        merchantReferenceId: uuidv4(),
        status: TransactionStatus.PENDING,
        user,
      });
      switch (body.transactionType) {
        case TransactionType.DEPOSIT:
          transaction.fromAccount = fromAccount.id;
          transaction.type = TransactionType.DEPOSIT;
          fromAccount.balance =
            parseFloat((+fromAccount.balance).toFixed(2)) +
            parseFloat((+body.amount).toFixed(2));
          break;
        case TransactionType.WITHDRAWAL:
          transaction.fromAccount = fromAccount.id;
          transaction.type = TransactionType.WITHDRAWAL;
          fromAccount.balance =
            parseFloat((+fromAccount.balance).toFixed(2)) -
            parseFloat((+body.amount).toFixed(2));
          break;
        case TransactionType.TRANSFER:
          transaction.fromAccount = fromAccount.id;
          transaction.type = TransactionType.TRANSFER;
          transaction.toAccount = toAccount.id;
          fromAccount.balance =
            parseFloat((+fromAccount.balance).toFixed(2)) -
            parseFloat((+body.amount).toFixed(2));
          toAccount.balance =
            parseFloat((+toAccount.balance).toFixed(2)) +
            parseFloat((+body.amount).toFixed(2));
          break;

        default:
          throw new BadRequestException("Please Chose Valid Transaction Type");
      }
      let newTransaction = await TransactionRepo.save(transaction);
      fromAccount.lastChangedDateTime = new Date();
      await AccountRepo.update(fromAccount.id, fromAccount);
      if (newTransaction.type == TransactionType.TRANSFER) {
        toAccount.lastChangedDateTime = new Date();
        await AccountRepo.update(toAccount.id, toAccount);
      }
      newTransaction.status = TransactionStatus.SUCCESS;
      newTransaction.lastChangedDateTime = new Date();
      await TransactionRepo.update(newTransaction.id, newTransaction);

      return {
        merchant: newTransaction.merchantReferenceId,
        amount: newTransaction.amount,
        status: newTransaction.status,
        type: newTransaction.type,
        senderName: newTransaction.user.userName,
        senderCardNumer:
          "**** **** **** " + fromAccount.cardNumber.toString().slice(12),
        reciverCardNumber: toAccount
          ? "**** **** **** " + toAccount.cardNumber.toString().slice(12)
          : null,
        reciverName: toAccount ? toAccount.user.userName : null,
        createDateTime: newTransaction.createDateTime,
      };
    } catch (e) {
      let rejectedTransaction = this.Transactionrepo.create({
        amount: body.amount,
        type: body.transactionType,
        fromAccount: body.fromAccountId,
        toAccount: toAccount ? toAccount.id : null,
        status: TransactionStatus.REJECTED,
        merchantReferenceId: uuidv4(),
        user,
      });
      await this.Transactionrepo.save(rejectedTransaction);

      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async getMyTransactions(userId) {
    let user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException(USER_NOT_EXIST);
    let transactions = await AppDataSource.createQueryBuilder(
      Transaction,
      "Transaction"
    )
      .leftJoinAndSelect("Transaction.user", "user")
      .where("user.id =:id", { id: userId })
      .select([
        "Transaction.status",
        "Transaction.type",
        "Transaction.amount",
        "Transaction.toAccount",
        "Transaction.fromAccount",
        "user.id",
      ])
      .orderBy("Transaction.id", "DESC")
      .getMany();
    if (transactions.length > 0) {
      for (let transaction of transactions) {
        let fromAccount = await this.accountService.findOne(
            transaction.fromAccount
          ),
          toAccount = await this.accountService.findOne(transaction.toAccount);
        if (
          !fromAccount ||
          (!toAccount && transaction.type == TransactionType.TRANSFER)
        )
          throw new BadRequestException("Please Contact Support");
        transaction["fromAccountDetails"] = fromAccount;
        transaction["toAccountDetails"] = toAccount;
        delete transaction.fromAccount;
        delete transaction.toAccount;
      }
    }
    return transactions;
  }
}
