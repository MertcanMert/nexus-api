import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('S3_REGION');
    const accessKeyId = this.configService.getOrThrow<string>('S3_ACCESS_KEY');
    const secretAccessKey =
      this.configService.getOrThrow<string>('S3_SECRET_KEY');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    this.bucket = this.configService.getOrThrow<string>('S3_BUCKET');
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL') || '';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint: endpoint || undefined,
      forcePathStyle: !!endpoint,
    } as any);
  }

  /**
   * Uploads a file to the configured S3 storage
   * @param file Multi-part file object
   * @param folder Destination folder (optional)
   * @returns Public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    try {
      this.logger.log(`Uploading file to S3: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Default public access for most S3-compatible storage
      });

      await this.s3Client.send(command);

      // URL Strategy: Use S3_PUBLIC_URL if set, otherwise construct standard S3 URL
      const fileUrl = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : `https://${this.bucket}.s3.${this.configService.get('S3_REGION')}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`S3 Upload Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('File upload failed.');
    }
  }

  /**
   * Deletes a file from S3
   * @param fileUrl Full URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.getKeyFromUrl(fileUrl);
    if (!key) return;

    try {
      this.logger.log(`Deleting file from S3: ${key}`);
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`S3 Delete Error: ${error.message}`);
    }
  }

  private getKeyFromUrl(fileUrl: string): string | null {
    try {
      const url = new URL(fileUrl);
      // İlk karakter / olduğu için slice(1) yapıyoruz
      return url.pathname.slice(1);
    } catch (e) {
      return null;
    }
  }
}
