import { createKeyv } from '@keyv/redis';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const KeyvOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const redisHost = config.get<string>('REDIS_HOST', 'localhost');
    const redisPort = config.get<number>('REDIS_PORT', 6379);
    const redisPassword = config.get<string>('REDIS_PASSWORD');

    const redisUrl = redisPassword
      ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
      : `redis://${redisHost}:${redisPort}`;

    return {
      stores: [createKeyv(redisUrl)],
    };
  },
};
