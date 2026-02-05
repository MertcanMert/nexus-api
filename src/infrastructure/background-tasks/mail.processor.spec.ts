import { Test, TestingModule } from '@nestjs/testing';
import { MailProcessor } from './mail.processor';
import { MailService } from '../mail/mail.service';
import { Job } from 'bullmq';

describe('MailProcessor', () => {
  let processor: MailProcessor;
  let mailService: MailService;

  const mockMailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProcessor,
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
    mailService = module.get<MailService>(MailService);
  });

  it('should process send-email job', async () => {
    const mockJob = {
      name: 'send-email',
      data: { email: 'test@example.com', subject: 'Sub', body: 'Body' },
      id: '1',
    } as Job;

    await processor.process(mockJob);

    expect(mockMailService.sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Sub',
      'Body',
    );
  });

  it('should handle send-email failure', async () => {
    mockMailService.sendEmail.mockRejectedValue(new Error('SMTP Error'));
    const mockJob = {
      name: 'send-email',
      data: { email: 'fail@example.com' },
      id: '1',
    } as Job;

    await expect(processor.process(mockJob)).rejects.toThrow('SMTP Error');
  });
});
