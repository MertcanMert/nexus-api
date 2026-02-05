import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Role } from '@prisma/client';

@Injectable()
export class OwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OwnershipGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const i18n = I18nContext.current();

    // User from JwtAuthGuard
    const user = request.user;
    // URL parameter :id
    const params = request.params;

    if (!user) {
      this.logger.warn('OwnershipGuard: No user found in request');
      return false;
    }

    // Admin can access everything
    if (user.role === Role.ADMIN) {
      this.logger.log(`Admin access granted for user: ${user.userId}`);
      return true;
    }

    // Check if user owns the resource
    if (user.userId !== params.id) {
      const message =
        i18n?.t('common.AUTH.INVALID_AUTHORIZATION') ||
        'You do not have permission to access this resource';
      this.logger.warn(
        `Ownership denied: User ${user.userId} attempted to access resource ${params.id}`,
      );
      throw new ForbiddenException(message);
    }

    this.logger.log(`Ownership verified for user: ${user.userId}`);
    return true;
  }
}
