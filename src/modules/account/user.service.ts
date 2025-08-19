import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  SetupSuperUserDto,
  UpdateUserDto,
  UserFilterOptionDto,
} from './dto/user.dto';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { RoleRepository } from '../role/repository/role.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository
  ) {}

  async getAll(filter: UserFilterOptionDto): Promise<{ users: User[]; totalCount: number }> {
    return await this.userRepository.getAll(filter);
  }

  // Get a user by ID
  async getById(id: string): Promise<User> {
    const user = await this.userRepository.getById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // Get a user by email
  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  // Get a user by username
  async getByUsername(username: string): Promise<User> {
    const user = await this.userRepository.getByUsername(username);
    if (!user) throw new NotFoundException(`User with username ${username} not found`);
    return user;
  }

  // Create a new user
  async create(payload: CreateUserDto): Promise<User> {
    const exist = await this.userRepository.getByEmail(payload.email);
    if (exist) {
      throw new BadRequestException('Email is already in use');
    }

    const role = await this.roleRepository.getById(payload.roleId);
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const user = await this.createUserEntity(payload, role.id);
    user.password = await bcrypt.hash(payload.password, 10);

    return this.userRepository.save(user);
  }

  async setupSuperUser(payload: SetupSuperUserDto): Promise<void> {
    await this.validateSuperUserSetup();

    const role = await this.roleRepository.getByName('super_admin');
    if (!role) {
      throw new BadRequestException('Superadmin role not found');
    }

    const superUser = await this.createUserEntity(payload, role.id);
    superUser.password = await bcrypt.hash(payload.password, 10);

    await this.userRepository.save(superUser);
  }

  // Update an existing user's information
  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If email is provided, check for conflicts
    if (userData.email) {
      const existingUser = await this.userRepository.getByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Email is already in use by another user');
      }
    }

    // Merge updates
    const updatedUserData: Partial<User> = {
      ...user,
      ...userData,
    };

    // If password is provided, hash it
    if (userData.password) {
      updatedUserData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updatedUserData);
    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }
    return updatedUser;
  }

  // Delete a user by ID
  async delete(id: string): Promise<void> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);
  }

  private async validateSuperUserSetup(): Promise<void> {
    const exists = await this.userRepository.getSuperUser();
    if (exists) {
      throw new BadRequestException('Superuser already exists');
    }
  }

  private async createUserEntity(
    payload: CreateUserDto | SetupSuperUserDto,
    roleId?: string
  ): Promise<User> {
    const payloadRoleId = 'roleId' in payload ? payload.roleId : undefined;

    return User.create({
      name: payload.name,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      roleId: roleId || payloadRoleId,
    });
  }
}
