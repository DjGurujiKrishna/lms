import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private client!: S3Client;
  private bucket!: string;
  private region!: string;
  private cloudFrontBase!: string | undefined;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') ?? '';
    this.region = this.config.get<string>('AWS_REGION') ?? 'ap-south-1';
    this.cloudFrontBase = this.config
      .get<string>('AWS_CLOUDFRONT_BASE_URL')
      ?.replace(/\/$/, '');

    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');

    this.client = new S3Client({
      region: this.region,
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });

    if (!this.bucket) {
      this.logger.warn('AWS_S3_BUCKET is not set — uploads will fail');
    }
    if (!this.cloudFrontBase) {
      this.logger.warn(
        'AWS_CLOUDFRONT_BASE_URL is not set — public URLs will use S3 website-style path',
      );
    }
  }

  /**
   * Upload bytes to S3. Caller supplies the object key (path inside bucket).
   */
  async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    if (!this.bucket) {
      throw new BadRequestException('AWS_S3_BUCKET is not configured');
    }

    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    };

    await this.client.send(new PutObjectCommand(input));
  }

  /**
   * Public URL served to clients (CloudFront when configured; else virtual-hosted–style S3 URL).
   */
  publicUrlForKey(key: string): string {
    const normalizedKey = key.replace(/^\/+/, '');
    if (this.cloudFrontBase) {
      return `${this.cloudFrontBase}/${normalizedKey}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${normalizedKey}`;
  }
}
