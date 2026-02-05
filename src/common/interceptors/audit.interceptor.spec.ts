import { Test, TestingModule } from '@nestjs/testing';
import { AuditInterceptor } from './audit.interceptor';
import { BackgroundTasksService } from 'src/infrastructure/background-tasks/background-tasks.service';

import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let backgroundTasksService: BackgroundTasksService;

  const mockBackgroundTasksService = {
    addAuditLogTask: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: BackgroundTasksService,
          useValue: mockBackgroundTasksService,
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    backgroundTasksService = module.get<BackgroundTasksService>(
      BackgroundTasksService,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should NOT trigger audit log for GET requests', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/v1/user',
          headers: {},
          get: jest.fn().mockReturnValue(''),
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    await interceptor.intercept(context, next).toPromise();

    expect(mockBackgroundTasksService.addAuditLogTask).not.toHaveBeenCalled();
  });

  it('should trigger audit log for POST requests', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/api/v1/user',
          body: { email: 'test@example.com', password: 'password123' },
          ip: '127.0.0.1',
          get: jest.fn().mockReturnValue('test-agent'),
          user: { userId: '1', tenantId: 'tenant-1' },
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({ success: true, data: { tenantId: 'tenant-1' } }),
    };

    const observable = interceptor.intercept(context, next);
    await observable.toPromise();

    expect(mockBackgroundTasksService.addAuditLogTask).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: '1',
        action: 'POST_USER',
        payload: expect.objectContaining({ password: '********' }), // Masking check
      }),
    );
  });
});
