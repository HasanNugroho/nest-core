import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../account/repository/user.repository';
import { PaginationOptionsDto } from 'src/common/dto/page-option.dto';
import { Role } from './entity/role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleRepository } from './repository/role.repository';
import * as rolesData from 'src/data/role-permissions.json';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository
  ) {}

  async getById(id: string): Promise<Role> {
    const role = await this.roleRepository.getById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async getAll(filter: PaginationOptionsDto): Promise<{ roles: Role[]; totalCount: number }> {
    const { roles, totalCount } = await this.roleRepository.getAll(filter);

    return { roles, totalCount };
  }

  async create(payload: CreateRoleDto): Promise<void> {
    const existingRole = await this.roleRepository.getByName(payload.name);
    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    const role = Role.create(payload.name, payload.description, payload.permissions);

    if (!this.validatePermissions(role.permissions)) {
      throw new BadRequestException('Invalid permissions provided.');
    }

    await this.roleRepository.create(role);
  }

  async update(id: string, payload: UpdateRoleDto): Promise<void> {
    const role = await this.roleRepository.getById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.name.toLowerCase() === 'superadmin') {
      throw new BadRequestException('Cannot update a superuser role.');
    }

    role.name = payload.name ?? role.name;
    role.description = payload.description ?? role.description;

    if (payload.permissions) {
      role.permissions = payload.permissions;

      if (!this.validatePermissions(role.permissions)) {
        throw new BadRequestException('Invalid permissions provided.');
      }
    }

    await this.roleRepository.update(id, role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.roleRepository.getById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    const users = await this.userRepository.getAllByRoleId(id);
    if (users.length > 0) {
      throw new BadRequestException('Role masih digunakan oleh user');
    }

    await this.roleRepository.delete(id);
  }

  /**
   * Validates the assigned permissions against the config list.
   * @returns true if valid, false if contains unknown permissions.
   */
  private validatePermissions(userPermission: string[]): boolean {
    const invalid = userPermission.filter(
      (permission) => !rolesData.permissions.includes(permission)
    );
    return invalid.length === 0;
  }
}
