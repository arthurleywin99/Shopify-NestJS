import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/core/utils/logger';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MinIOService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @Inject(S3Client) private readonly s3Client: S3Client,
  ) {}

  async onModuleInit() {
    const bucketName = this.configService.get('S3_BUCKET');

    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      AppLogger.warn(
        `[MinIO]: Bucket "${bucketName}" already exists. Nothing todo`,
      );
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        AppLogger.log(`[MinIO]: Bucket "${bucketName}" not found. Creating...`);
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: bucketName }),
        );
        AppLogger.log(`[MinIO]: Bucket "${bucketName}" created.`);
      } else {
        AppLogger.error(
          `[MinIO]: Failed to check/create bucket: ${error.message}`,
        );
        throw error;
      }
    }
  }

  async uploadImage(file: Express.Multer.File, privateMode?: boolean) {
    const bucket = this.configService.get('S3_BUCKET');

    const key = `${uuid()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: privateMode ? 'private' : 'public-read',
    });

    await this.s3Client.send(command);

    return {
      key,
      bucket,
      url: `${this.configService.get('S3_ENDPOINT')}/${bucket}/${key}`,
    };
  }
}
