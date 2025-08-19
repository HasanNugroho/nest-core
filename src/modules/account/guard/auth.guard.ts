import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { IS_PUBLIC_KEY, ONE_HOUR_MS } from 'src/common/constant';
import { UserRepository } from '../repository/user.repository';
import { RoleRepository } from 'src/modules/role/repository/role.repository';
import { User } from '../entity/user.entity';
import { Role } from 'src/modules/role/entity/role.entity';
import * as _ from 'lodash';
import * as rolesJson from 'src/data/role-permissions.json';

const defaultRoles: string[] = rolesJson.default_permission;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userRepository: UserRepository,

    private readonly roleRepository: RoleRepository,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { isPublic, roles = [] } = this.validatePublicRoles(context);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not provided or malformed');
    }

    const blacklistKey = `blacklist:access-token:${token}`;
    const isBlacklisted = await this.cacheManager.get(blacklistKey);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    try {
      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      const user = await this.fetchUser(payload.id);
      const role = await this.getRole(user.roleId);
      role.permissions = role.permissions ?? defaultRoles;

      user.role = role;
      request.user = user;

      // Bypass all checks for system-level users
      if (role.permissions.includes('manage:system')) {
        return true;
      }

      // Check if user has required permissions
      if (roles.length > 0 && _.intersection(roles, role.permissions).length === 0) {
        throw new ForbiddenException('User does not have required roles');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validatePublicRoles(context: ExecutionContext): {
    isPublic: boolean;
    roles: string[];
  } {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      if (roles && _.intersection(roles, defaultRoles).length > 0) {
        return { isPublic: false, roles };
      }

      return { isPublic: true, roles };
    }

    return { isPublic: false, roles };
  }

  private async fetchUser(userId: string): Promise<User> {
    const key = `user:${userId}`;
    const cache = await this.cacheManager.get<User | null>(key);

    if (cache) return plainToInstance(User, cache);

    const user = await this.userRepository.getById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    await this.cacheManager.set(key, user, ONE_HOUR_MS);
    return user;
  }

  private async getRole(roleId: string): Promise<Role> {
    const key = `role:${roleId}`;
    const cache = await this.cacheManager.get<Role>(key);

    if (cache) return plainToInstance(Role, cache);

    const role = await this.roleRepository.getById(roleId);
    if (!role) throw new UnauthorizedException('role not found');

    await this.cacheManager.set(key, role, ONE_HOUR_MS);
    return role;
  }
}
