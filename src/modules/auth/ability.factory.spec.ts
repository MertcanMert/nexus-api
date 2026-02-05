import { AbilityFactory } from './ability.factory';
import { Role } from '@prisma/client';
import { Action } from 'src/common/enums/action.enum';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

describe('AbilityFactory', () => {
  let factory: AbilityFactory;

  beforeEach(() => {
    factory = new AbilityFactory();
  });

  it('should grant Manage permission to ADMIN', () => {
    const user: AuthenticatedUser = {
      userId: '1',
      email: 'admin@test.com',
      role: Role.ADMIN,
      tenantId: 'tenant-1',
    };

    const permissions = factory.defineAbilities(user);
    expect(permissions).toContain(Action.Manage);
  });

  it('should grant Read and Update permissions to USER', () => {
    const user: AuthenticatedUser = {
      userId: '2',
      email: 'user@test.com',
      role: Role.USER,
      tenantId: 'tenant-1',
    };

    const permissions = factory.defineAbilities(user);
    expect(permissions).toContain(Action.Read);
    expect(permissions).toContain(Action.Update);
    expect(permissions).not.toContain(Action.Manage);
  });
});
