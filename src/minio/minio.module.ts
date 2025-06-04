import { Module } from '@nestjs/common';
import { MinIOService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { AppLogger } from 'src/core/utils/logger';

@Module({
  providers: [
    MinIOService,
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        try {
          const s3Client = new S3Client({
            region: 'auto',
            endpoint: configService.get<string>('S3_ENDPOINT') || '',
            credentials: {
              accessKeyId: configService.get<string>('S3_ACCESS_KEY') || '',
              secretAccessKey: configService.get<string>('S3_SECRET_KEY') || '',
            },
            forcePathStyle: true,
          });

          AppLogger.log('[MinIO]: Connected');
          return s3Client;
        } catch (error) {
          AppLogger.error(`[MinIO]: error, ${error.message}`);
          return undefined;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [MinIOService],
})
export class MinIOModule {}
