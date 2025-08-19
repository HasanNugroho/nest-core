import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { UserFilterOptionDto } from '../dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly db: Repository<User>
  ) {}

  async getById(id: string): Promise<User | null> {
    return await this.db.findOneBy({ id });
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.db.findOneBy({ email });
  }

  async getByUsername(username: string): Promise<User | null> {
    return await this.db.findOneBy({ username });
  }

  async getAllByRoleId(roleId: string): Promise<User[]> {
    return this.db.find({ where: { roleId } });
  }

  async getAll(filter: UserFilterOptionDto): Promise<{ users: User[]; totalCount: number }> {
    const offset = (filter.page - 1) * filter.limit;
    let where: FindOptionsWhere<User>[] = [];

    if (filter.keyword) {
      where = [{ username: ILike(`${filter.keyword}%`) }, { email: ILike(`${filter.keyword}%`) }];
    }

    const [users, totalCount] = await this.db.findAndCount({
      where: where.length ? where : {},
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        roleId: true,
        role: {
          id: true,
          name: true,
        },
        updatedAt: true,
        createdAt: true,
      },
      relations: {
        role: true,
      },
      order: {
        [filter.orderby || 'createdAt']: filter.order || 'DESC',
      },
      skip: offset,
      take: filter.limit,
    });

    return { users, totalCount };
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const entity = await this.db.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('User not found');

    Object.assign(entity, userData);
    return await this.db.save(entity);
  }

  async save(user: User): Promise<User> {
    try {
      return await this.db.save(user);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSuperUser(): Promise<User | null> {
    return this.db.findOne({
      where: {
        role: { name: 'super_admin' },
      },
      relations: ['role'],
    });
  }
}
