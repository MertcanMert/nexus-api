import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const i18n = I18nContext.current();

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles decorator, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      this.logger.warn(
        "RoleGuard: Kullanıcı objesi veya rolü bulunamadı! JwtAuthGuard'ın doğru çalıştığından emin olun.",
      );
      return false;
    }

    // Check if user's role is in the required roles list
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      const message =
        i18n?.t('common.AUTH.INVALID_AUTHORIZATION') ||
        'Insufficient permissions';
      this.logger.warn(
        `Access denied for user ${user.userId}: required roles [${requiredRoles.join(', ')}], user role: ${user.role}`,
      );
      throw new ForbiddenException(message);
    }

    this.logger.log(
      `Access granted for user ${user.userId} with role ${user.role}`,
    );
    return true;
  }
}
