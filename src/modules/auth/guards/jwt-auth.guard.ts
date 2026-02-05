import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: AuthenticatedUser | null,
    info?: unknown,
  ): TUser {
    if (err || !user) {
      const i18n = I18nContext.current();

      const reason = this.extractReason(info);

      this.logger.warn(`Authentication failed: ${reason}`);

      const message = this.resolveI18nMessage(reason, i18n);

      throw new UnauthorizedException(message);
    }

    this.logger.log(`User authenticated: ${user.userId}`);
    return user as TUser;
  }

  private extractReason(info?: unknown): string {
    if (!info) return 'NO_TOKEN';

    if (typeof info === 'string') return info;

    if (info instanceof Error) return info.message;

    return 'INVALID_TOKEN';
  }

  private resolveI18nMessage(reason: string, i18n?: I18nContext): string {
    switch (reason) {
      case 'jwt expired':
        return i18n?.t('common.AUTH.TOKEN_EXPIRED') ?? 'Session expired';

      case 'No auth token':
      case 'NO_TOKEN':
        return i18n?.t('common.AUTH.TOKEN_MISSING') ?? 'Token missing';

      default:
        return i18n?.t('common.AUTH.INVALID_TOKEN') ?? 'Invalid token';
    }
  }
}
