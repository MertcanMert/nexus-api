import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OwnershipGuard } from './ownership.guard';
import { Role } from '@prisma/client';
import { I18nContext } from 'nestjs-i18n';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;

  const mockI18n = {
    t: jest.fn((key) => key),
  };

  beforeEach(() => {
    guard = new OwnershipGuard();
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);
  });

  const createMockContext = (
    user: any,
    params: any,
  ): Partial<ExecutionContext> => ({
    switchToHttp: () =>
      ({
        getRequest: () => ({
          user,
          params,
        }),
      }) as any,
  });

  it('should allow access if user is ADMIN', () => {
    const context = createMockContext(
      { userId: '1', role: Role.ADMIN },
      { id: '2' },
    );
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should allow access if user is the OWNER', () => {
    const context = createMockContext(
      { userId: '1', role: Role.USER },
      { id: '1' },
    );
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should throw ForbiddenException if user is NOT owner and not ADMIN', () => {
    const context = createMockContext(
      { userId: '1', role: Role.USER },
      { id: '2' },
    );
    expect(() => guard.canActivate(context as ExecutionContext)).toThrow(
      ForbiddenException,
    );
  });

  it('should return false if NO user is found in request', () => {
    const context = createMockContext(null, { id: '1' });
    expect(guard.canActivate(context as ExecutionContext)).toBe(false);
  });
});
