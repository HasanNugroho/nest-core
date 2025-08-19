import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  SetupSuperUserDto,
  UpdateUserDto,
  UserFilterOptionDto,
} from './dto/user.dto';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { HttpResponse } from 'src/common/dto/response.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Endpoint untuk create user' })
  @ApiCreatedResponse({
    description: 'Response success create user',
    type: User,
    isArray: false,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiConflictResponse({
    description: 'Email or username already exists',
  })
  @Post()
  @Public()
  async create(@Body() payload: CreateUserDto) {
    const result = await this.userService.create(payload);
    return new HttpResponse(HttpStatus.CREATED, true, 'create user successfully', result);
  }

  @ApiOperation({ summary: 'Get users' })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Roles('manage:system')
  @Get()
  async getAll(@Query() filter: UserFilterOptionDto) {
    const { users, totalCount } = await this.userService.getAll(filter);
    return new HttpResponse(
      HttpStatus.OK,
      true,
      'fetch user(s) successfully',
      users,
      new PageMetaDto(filter, totalCount)
    );
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Roles('users:read')
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.userService.getById(id);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @Roles('users:update')
  @Put(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() userData: UpdateUserDto) {
    const result = await this.userService.update(id, userData);
    return new HttpResponse(HttpStatus.OK, true, 'update user successfully', result);
  }

  @ApiOperation({ summary: 'Setup superuser (hanya satu kali)' })
  @ApiCreatedResponse({
    description: 'Superuser berhasil dibuat',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Superuser sudah ada',
  })
  @Post('setup-superuser')
  @Public()
  async setupSuperUser(@Body() payload: SetupSuperUserDto) {
    await this.userService.setupSuperUser(payload);
    return new HttpResponse(HttpStatus.CREATED, true, 'superuser created successfully');
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Roles('users:delete')
  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.userService.delete(id);
    return new HttpResponse(HttpStatus.OK, true, 'delete user successfully', result);
  }
}
