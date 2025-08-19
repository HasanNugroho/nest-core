import { Module } from '@nestjs/common';
import config from './config/config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionSource } from './config/database.config';
import { LoggerModule } from './service/logger/logger.module';
import { KeyvOptions } from './config/redis.config';
import { CacheModule } from '@nestjs/cache-manager';
import { AccountModule } from './modules/account/account.module';
import { RoleModule } from './modules/role/role.module';
import { AuthGuard } from './modules/account/guard/auth.guard';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development', '.env'],
      load: [config],
    }),
    TypeOrmModule.forRoot(connectionSource.options),
    CacheModule.registerAsync(KeyvOptions),
    LoggerModule,
    AccountModule,
    RoleModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
