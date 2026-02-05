import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLog', () => {
    it('should call prisma.auditLog.create with correct data', async () => {
      const logData = {
        userId: '1',
        action: 'TEST_ACTION',
        resource: 'TEST_RESOURCE',
        payload: { key: 'value' },
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        tenantId: 'tenant-1',
      };

      await service.createLog(logData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'TEST_ACTION',
          resource: 'TEST_RESOURCE',
          payload: { key: 'value' },
          userId: '1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
          tenantId: 'tenant-1',
        },
      });
    });

    it('should ignore undefined optional fields', async () => {
      const logData = {
        action: 'TEST_ACTION',
        resource: 'TEST_RESOURCE',
      };

      await service.createLog(logData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'TEST_ACTION',
          resource: 'TEST_RESOURCE',
          payload: {},
        },
      });
    });
  });

  describe('getLogsByUserId', () => {
    it('should return logs for a specific user', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.getLogsByUserId('1');
      expect(result).toEqual([{ id: '1' }]);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
