import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppLogger } from 'src/core/utils/logger';

@Module({
  imports: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const client = new Redis({
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT') || '6379', 10),
        });
        client.on('connect', () => AppLogger.log('[Redis]: Connected'));
        client.on('error', (err) => console.error('[Redis]: Error:', err));
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
