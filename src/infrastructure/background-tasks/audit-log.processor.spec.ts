import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogProcessor } from './audit-log.processor';
import { AuditService } from '../audit/audit.service';
import { Job } from 'bullmq';

describe('AuditLogProcessor', () => {
  let processor: AuditLogProcessor;
  let auditService: AuditService;

  const mockAuditService = {
    createLog: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogProcessor,
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    processor = module.get<AuditLogProcessor>(AuditLogProcessor);
    auditService = module.get<AuditService>(AuditService);
  });

  it('should process audit-log job', async () => {
    const mockJob = {
      name: 'audit-log',
      data: { action: 'TEST_ACTION', resource: 'TEST_RESOURCE' },
      id: '1',
    } as Job;

    await processor.process(mockJob);

    expect(mockAuditService.createLog).toHaveBeenCalledWith(mockJob.data);
  });

  it('should handle audit-log failure', async () => {
    mockAuditService.createLog.mockRejectedValue(
      new Error('Persistence Error'),
    );
    const mockJob = {
      name: 'audit-log',
      data: { action: 'FAIL' },
      id: '1',
    } as Job;

    await expect(processor.process(mockJob)).rejects.toThrow(
      'Persistence Error',
    );
  });
});
