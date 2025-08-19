import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const isProduction = process.env.NODE_ENV === 'production';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  entities: [path.join(__dirname, '/../**/*.entity.{ts,js}')],
  synchronize: false,
  logging: !isProduction,
  migrations: [
    path.join(
      __dirname,
      isProduction ? '/../dist/migrations/*.js' : '/../**/migrations/*.ts',
    ),
  ],
};

export const connectionSource = new DataSource(dataSourceOptions);
