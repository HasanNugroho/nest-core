import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entity/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './repository/role.repository';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(() => AccountModule)],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
