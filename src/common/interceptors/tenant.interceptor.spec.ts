import { Test, TestingModule } from '@nestjs/testing';
import { TenantInterceptor } from './tenant.interceptor';
import { ClsService } from 'nestjs-cls';
import { ExecutionContext } from '@nestjs/common';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;
  let cls: ClsService;

  const mockClsService = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantInterceptor,
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    interceptor = module.get<TenantInterceptor>(TenantInterceptor);
    cls = module.get<ClsService>(ClsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set TENANT_ID from user if authenticated', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { tenantId: 'tenant-user' },
          headers: { 'x-tenant-id': 'tenant-header' },
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => ({ pipe: jest.fn() }),
    };

    interceptor.intercept(context, next as any);

    expect(mockClsService.set).toHaveBeenCalledWith('TENANT_ID', 'tenant-user');
  });

  it('should set TENANT_ID from header if NO user is authenticated', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-tenant-id': 'tenant-header' },
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => ({ pipe: jest.fn() }),
    };

    interceptor.intercept(context, next as any);

    expect(mockClsService.set).toHaveBeenCalledWith(
      'TENANT_ID',
      'tenant-header',
    );
  });

  it('should NOT set anything if no tenant info exists', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => ({ pipe: jest.fn() }),
    };

    interceptor.intercept(context, next as any);

    expect(mockClsService.set).not.toHaveBeenCalled();
  });
});
