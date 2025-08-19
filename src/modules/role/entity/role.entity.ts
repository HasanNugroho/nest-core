import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../account/entity/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column('jsonb', { name: 'permissions' })
  permissions: string[];

  @Column('boolean', { name: 'is_system', default: false })
  isSystem: boolean;

  @JoinColumn()
  users?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Factory method to create a new Role instance.
   */
  static create(
    name: string,
    description: string,
    permissions: string[],
    isSystem: boolean = false
  ): Role {
    const role = new Role();
    role.name = name;
    role.description = description;
    role.permissions = permissions;
    role.isSystem = isSystem;
    return role;
  }
}
