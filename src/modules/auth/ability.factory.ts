import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Action } from 'src/common/enums/action.enum';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class AbilityFactory {
  /**
   * Defines permissions for a specific user.
   * This is where the core RBAC logic lives.
   */
  defineAbilities(user: AuthenticatedUser): Action[] {
    const permissions: Action[] = [];

    // ADMIN has full access
    if (user.role === Role.ADMIN) {
      permissions.push(Action.Manage);
    }

    // Standard USER permissions
    if (user.role === Role.USER) {
      permissions.push(Action.Read);
      permissions.push(Action.Update); // Can update own profile (handled by OwnershipGuard later)
    }

    return permissions;
  }
}
