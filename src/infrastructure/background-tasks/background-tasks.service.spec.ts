import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundTasksService } from './background-tasks.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('BackgroundTasksService', () => {
  let service: BackgroundTasksService;
  let queue: any;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: '1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackgroundTasksService,
        { provide: getQueueToken('mail-queue'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<BackgroundTasksService>(BackgroundTasksService);
    queue = module.get(getQueueToken('mail-queue'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEmailTask', () => {
    it('should add a send-email job to the queue', async () => {
      await service.addEmailTask('test@example.com', 'Subject', 'Body');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        { email: 'test@example.com', subject: 'Subject', body: 'Body' },
        expect.any(Object),
      );
    });
  });

  describe('addAuditLogTask', () => {
    it('should add an audit-log job to the queue', async () => {
      const data = { action: 'TEST' };
      await service.addAuditLogTask(data);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'audit-log',
        data,
        expect.any(Object),
      );
    });
  });
});
