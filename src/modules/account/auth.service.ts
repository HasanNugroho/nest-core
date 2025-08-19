import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repository/user.repository';
import { CredentialDto, CredentialResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(credential: CredentialDto): Promise<CredentialResponse> {
    const { email, password } = credential;

    const user = await this.userRepository.getByEmail(email);
    console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user.id);
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    try {
      const accessClaims = await this.decodeToken(accessToken, true);
      const refreshClaims = await this.decodeToken(refreshToken, true, true);

      await this.blacklistToken('access-token', accessToken, accessClaims.exp);
      await this.blacklistToken('refresh-token', refreshToken, refreshClaims.exp);
    } catch (error) {
      throw new BadRequestException('Failed to blacklist token', {
        cause: error,
      });
    }
  }

  async refreshToken(refreshToken: string): Promise<CredentialResponse> {
    const blacklistKey = `blacklist:refresh-token:${refreshToken}`;
    const isBlacklisted = await this.cacheManager.get(blacklistKey);
    if (isBlacklisted) throw new UnauthorizedException('Token is blacklisted');

    const claims = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('jwt.secret'),
    });

    if (claims.nbf) {
      const nbfDate = new Date(claims.nbf * 1000);
      if (new Date() < nbfDate) {
        throw new UnauthorizedException('Refresh token not yet valid');
      }
    }

    const id = claims.id;
    if (!id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.generateTokens(user.id);
  }

  private async generateTokens(id: string): Promise<CredentialResponse> {
    const tokenExpiresIn = this.configService.get<string>('jwt.expired');
    const refreshExpiresIn = this.configService.get<string>('jwt.refresh_expired');

    const payload = { id };

    // Generate Access Token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: tokenExpiresIn,
    });

    // Generate Refresh Token
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiresIn,
      notBefore: tokenExpiresIn,
    });

    return new CredentialResponse(accessToken, refreshToken, id);
  }

  private async decodeToken(token: string, ignoreExpiration = false, ignoreNotBefore = false) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('jwt.secret'),
      ignoreExpiration,
      ignoreNotBefore,
    });
  }

  private calculateTtl(exp?: number): number {
    const now = Date.now();
    if (!exp || exp * 1000 <= now) {
      return 60000;
    }
    const ttlInMs = exp * 1000 - now;
    return Math.max(ttlInMs, 60000);
  }

  private async blacklistToken(
    type: 'access-token' | 'refresh-token',
    token: string,
    exp?: number
  ) {
    const ttl = this.calculateTtl(exp);
    const key = `blacklist:${type}:${token}`;
    await this.cacheManager.set(key, true, ttl);
  }
}
