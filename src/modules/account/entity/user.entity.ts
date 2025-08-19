import { Role } from '../../role/entity/role.entity';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Entity,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index()
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Index()
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Index()
  @Column('uuid', { name: 'role_id' })
  roleId: string;

  @OneToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Factory method to create a new User instance.
   */
  static create(params: {
    name: string;
    email: string;
    username: string;
    password: string;
    role?: Role;
    roleId?: string;
  }): User {
    const user = new User();
    user.name = params.name;
    user.email = params.email;
    user.username = params.username;
    user.password = params.password;

    // Assign role if provided
    if (params.role) {
      user.role = params.role;
      user.roleId = params.role.id;
    } else if (params.roleId) {
      user.roleId = params.roleId;
    }

    return user;
  }

  toResponse() {
    const { password, ...userData } = this;
    return userData;
  }
}
