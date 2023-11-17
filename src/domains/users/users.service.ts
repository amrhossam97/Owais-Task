import { HttpService } from "@nestjs/axios";
import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChangePasswordDTO } from "@root/common/Dto/change-password.dto";
import { UpdateUserDTO } from "@root/common/Dto/update-user.dto";
import { VerifyPhoneNumber } from "@root/common/Dto/verify.dto";
import { HandleErrorMessage } from "@root/common/exceptions/error-filter";
import { Repository } from "typeorm";
import { User } from "../../database/entity/user.entity";
import {
  CODE_ERROR,
  OLD_PASSWORD_ERROR,
  USER_ALREADY_DELETED,
  USER_NOT_EXIST,
} from "@root/common/messages";
import AppDataSource from "@root/config/typeorm.config";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userrepo: Repository<User>,
    private httpService: HttpService
  ) {}

  async create(body: User): Promise<User | null> {
    const newuser = await this.userrepo.create(body);
    let result = await this.userrepo.save(newuser).catch((err) => {
      throw new BadRequestException(err.detail);
    });
    return result;
  }

  async delete(id: number) {
    if (!id) {
      return null;
    }
    let result = await this.userrepo.delete({ id });
    return result;
  }
  public async update(id: number, newValue: User): Promise<User | null> {
    try {
      const user = await this.userrepo.findOne({ where: { id } });
      if (!user.id) throw new BadRequestException(USER_NOT_EXIST);

      await this.userrepo.save(newValue).catch((err) => {
        throw new BadRequestException({ message: err.detail });
      });

      return await this.userrepo.findOne({ where: { id } });
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async findOne(id): Promise<User | null> {
    try {
      if (!id) {
        return null;
      }
      const user = await this.userrepo.findOne({ where: { id } });
      if (user) return user;
      return null;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async find(where: object): Promise<User | null> {
    if (!where) {
      return null;
    }
    const user = await this.userrepo.findOne({ where }).catch((err) => {
      throw new BadRequestException({ message: err });
    });

    if (user) return user;
    return null;
  }

  async getUserById(userId) {
    try {
      let result = await AppDataSource.createQueryBuilder(User, "user")
        .select([
          "user.id",
          "user.userName",
          "user.phoneNumber",
          "user.birthdate",
          "user.gender",
          "user.photo",
        ])
        .where("user.id = :id", { id: userId })
        .getOne();

      return result;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async findByPhoneOrId(phone?: string, id?: string) {
    if (phone) {
      return await this.find({ phoneNumber: phone });
    } else if (id) {
      return await this.findOne(id);
    }
  }
  async updateProfileImage(id, image) {
    try {
      let user = await this.findOne(id);
      if (!user) throw new BadRequestException(USER_NOT_EXIST);
      user.photo = image;
      await this.update(id, user);
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async updateUser(id, body: UpdateUserDTO) {
    try {
      let user = await this.findOne(id);
      if (!user) throw new BadRequestException(USER_NOT_EXIST);

      user.temp_phone = body.phoneNumber;
      user.smscode = Math.floor(1000 + Math.random() * 9000);
      // Send Verification SMS
      // Make The Code is Static 2222 For Testing
      user.smscode = 2222;
      await this.update(id, user);

      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }

  async verifyChangePhoneNumber(id, body: VerifyPhoneNumber) {
    try {
      let user = await this.findOne(id);
      if (!user) throw new BadRequestException(USER_NOT_EXIST);
      if (body.code != user.smscode) throw new BadRequestException(CODE_ERROR);
      user.phoneNumber = user.temp_phone;
      user.temp_phone = null;
      user.smscode = null;

      await this.update(id, user);
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async resendCode(id) {
    try {
      let user = await this.findOne(id);
      if (!user) throw new BadRequestException(USER_NOT_EXIST);
      user.smscode = Math.floor(1000 + Math.random() * 9000);
      // Send Verification SMS
      // Make The Code is Static 2222 For Testing
      user.smscode = 2222;

      await this.update(id, user);
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async changePassword(userId, body: ChangePasswordDTO) {
    try {
      let user = await this.findOne(userId);
      if (!user) throw new BadRequestException(USER_NOT_EXIST);
      const validPassword = await User.validatePassword(
        body.oldPassword,
        user.password
      );
      if (!validPassword) throw new BadRequestException(OLD_PASSWORD_ERROR);
      user.password = await User.hashPassword(body.newPassword);
      await this.update(userId, user);
      return true;
    } catch (e) {
      throw new HttpException(HandleErrorMessage(e), e.status ? e.status : 500);
    }
  }
  async findAll(where: object): Promise<User[] | null> {
    if (!where) {
      return null;
    }
    const user = await this.findAll({ where });
    if (user) return user;
    return null;
  }
  async deleteAccount(id) {
    let user = await this.findOne(id);
    if (!user) throw new BadRequestException(USER_NOT_EXIST);
    if (user.isDeleted == true)
      throw new BadRequestException(USER_ALREADY_DELETED);
    user.isDeleted = true;
    await this.update(id, user);
    return true;
  }
}
