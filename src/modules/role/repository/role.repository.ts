import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { Role } from '../entity/role.entity';
import { PaginationOptionsDto } from 'src/common/dto/page-option.dto';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly db: Repository<Role>
  ) {}

  async create(role: Role): Promise<Role> {
    try {
      return await this.db.save(role);
    } catch (error) {
      throw new InternalServerErrorException('Database error on role creation');
    }
  }

  async createMany(role: Role[]): Promise<Role[]> {
    return await this.db.save(role);
  }

  async getById(id: string): Promise<Role | null> {
    return this.db.findOneBy({ id });
  }

  async getByName(name: string): Promise<Role | null> {
    return this.db.findOneBy({ name });
  }

  async getAll(filter: PaginationOptionsDto): Promise<{ roles: Role[]; totalCount: number }> {
    const where: FindOptionsWhere<Role> = {};
    const offset = (filter.page - 1) * filter.limit;

    if (filter.keyword) {
      where.name = ILike(`%${filter.keyword}%`);
    }

    const [roles, totalCount] = await this.db.findAndCount({
      where,
      order: {
        [filter.orderby || 'created_at']: filter.order || 'DESC',
      },
      skip: offset,
      take: filter.limit,
    });

    return { roles, totalCount };
  }

  async getManyById(ids: string[]): Promise<Role[] | null> {
    return this.db.findBy({
      id: In(ids),
    });
  }

  async update(id: string, RoleData: Partial<Role>): Promise<void> {
    const existingRole = await this.db.findOneBy({ id });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    Object.assign(existingRole, RoleData);
    this.db.save(existingRole);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(id);
  }
}
