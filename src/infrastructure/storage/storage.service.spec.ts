import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('@aws-sdk/client-s3');
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('StorageService', () => {
  let service: StorageService;
  let configService: ConfigService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'S3_REGION') return 'us-east-1';
      if (key === 'S3_ACCESS_KEY') return 'key';
      if (key === 'S3_SECRET_KEY') return 'secret';
      if (key === 'S3_BUCKET') return 'test-bucket';
      return null;
    }),
    get: jest.fn((key: string) => {
      if (key === 'S3_ENDPOINT') return null;
      if (key === 'S3_PUBLIC_URL') return 'https://cdn.example.com';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file and return public URL', async () => {
      const mockFile = {
        originalname: 'test.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      const sendSpy = jest
        .spyOn(S3Client.prototype, 'send')
        .mockResolvedValue({} as any);

      const url = await service.uploadFile(mockFile, 'test');

      expect(url).toContain('https://cdn.example.com/test/');
      expect(url).toContain('.png');
      expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should throw InternalServerErrorException if upload fails', async () => {
      const mockFile = {
        originalname: 'test.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      jest
        .spyOn(S3Client.prototype, 'send')
        .mockRejectedValue(new Error('S3 Error'));

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete a file', async () => {
      const sendSpy = jest
        .spyOn(S3Client.prototype, 'send')
        .mockResolvedValue({} as any);

      await service.deleteFile('https://cdn.example.com/test/file.png');

      expect(sendSpy).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
  });
});
