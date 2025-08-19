import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorator/to-boolean.decorator';
import { PaginationOptionsDto } from 'src/common/dto/page-option.dto';

export class CreateUserDto {
  @ApiProperty({
    description: 'user email',
    example: 'adam@user.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nama user',
    example: 'adam',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Full name',
    example: 'adam',
  })
  @IsString()
  fullname: string;

  @ApiProperty({
    description: 'username',
    example: 'adam123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'password',
    required: true,
    example: 'adam123!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/[a-zA-Z]/, {
    message: 'Password must contain at least one letter.',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number.' })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'Password must contain at least one special character.',
  })
  password: string;

  @ApiProperty({ name: 'roleId', description: 'Role ID (UUID)' })
  @IsUUID('4')
  roleId: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'user email',
    example: 'adam@user.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nama user',
    example: 'adam',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'adam',
  })
  @IsString()
  @IsOptional()
  fullname?: string;

  @ApiProperty({
    description: 'uuid',
  })
  @IsUUID('4')
  @IsOptional()
  role_id?: string;

  @ApiProperty({
    description: 'password',
    example: 'adam123!',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/[a-zA-Z]/, {
    message: 'Password must contain at least one letter.',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number.' })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'Password must contain at least one special character.',
  })
  @IsOptional()
  password?: string;

  @ApiProperty({ name: 'roleId', description: 'Role ID (UUID)' })
  @IsUUID('4')
  @IsOptional()
  roleId: string;
}

export class UserFilterOptionDto extends PaginationOptionsDto {
  @ApiPropertyOptional({
    description: `Filter by active status:
    - true = show only active partners
    - false = show only inactive partners
    - (empty) = show all`,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}

export class SetupSuperUserDto extends OmitType(CreateUserDto, ['roleId'] as const) {}
