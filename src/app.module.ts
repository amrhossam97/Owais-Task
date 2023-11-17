import { Module, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { configService } from "./config/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { HttpModule } from "@nestjs/axios";
import { ResponseTransformInterceptor } from "./common/interceptors/respone-transform.interceptor";
import { UsersModule } from "./domains/users/users.module";
import { AccountsModule } from "./domains/accounts/account.module";
import { AuthModule } from "./domains/auth/auth.module";
import { TransactionsModule } from "./domains/transactions/transactions.module";
@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    HttpModule.register(configService.getAxiosConfig()),
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
