import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        const config = {
          MAIL_HOST: 'localhost',
          MAIL_PORT: 587,
          MAIL_SECURE: false,
          MAIL_USER: 'user',
          MAIL_PASS: 'pass',
          MAIL_FROM: 'from@example.com',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should successfully send an email', async () => {
      await service.sendEmail('to@example.com', 'Subject', '<h1>Body</h1>');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'from@example.com',
        to: 'to@example.com',
        subject: 'Subject',
        html: '<h1>Body</h1>',
      });
    });

    it('should throw error if sendMail fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(
        service.sendEmail('to@example.com', 'Subject', 'Body'),
      ).rejects.toThrow('SMTP Error');
    });
  });
});
