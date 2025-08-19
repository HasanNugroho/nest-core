import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { HttpResponse } from 'src/common/dto/response.dto';
import { CreateUserDto } from './dto/user.dto';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { CredentialDto, TokenPayloadDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from './entity/user.entity';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Invalid identifier or password' })
  @Public()
  @Post('login')
  async create(@Body() payload: CredentialDto) {
    const result = await this.authService.login(payload);
    return new HttpResponse(
      HttpStatus.OK,
      true,
      'User logged in successfully',
      result,
    );
  }

  @ApiOperation({ summary: 'Register' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Invalid identifier or password' })
  @Public()
  @Post('register')
  async register(@Body() payload: CreateUserDto) {
    const result = await this.userService.create(payload);
    return new HttpResponse(
      HttpStatus.CREATED,
      true,
      'User registered successfully',
      null,
    );
  }

  @ApiBearerAuth()
  @Get('me')
  async me(@CurrentUser() user: User) {
    const { password, ...userData } = user;
    return new HttpResponse(
      HttpStatus.OK,
      true,
      'Fetch user successfully',
      userData,
    );
  }

  @ApiBearerAuth()
  @Post('logout')
  async logout(@Req() req: any, @Body() body: TokenPayloadDto) {
    const accessToken = req.headers['authorization']?.split(' ')[1];
    const refreshToken = body.refreshToken;

    if (!accessToken || !refreshToken) {
      throw new BadRequestException('Access token or refresh token is missing');
    }

    await this.authService.logout(accessToken, refreshToken);
    return new HttpResponse(
      HttpStatus.OK,
      true,
      'User logged out successfully',
      null,
    );
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBadRequestResponse({ description: 'Missing or invalid refresh token' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: TokenPayloadDto) {
    const { refreshToken } = body;

    if (!refreshToken) {
      throw new BadRequestException('refresh token are required');
    }

    const result = await this.authService.refreshToken(refreshToken);
    return new HttpResponse(
      HttpStatus.OK,
      true,
      'Token refreshed successfully',
      result,
    );
  }
}
