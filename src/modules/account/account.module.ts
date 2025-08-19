import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserController } from './user.controller';
import { AuthController } from './auth.controller';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    RoleModule,
  ],
  controllers: [UserController, AuthController],
  providers: [UserRepository, UserService, AuthService],
  exports: [UserService, AuthService, UserRepository],
})
export class AccountModule {}
