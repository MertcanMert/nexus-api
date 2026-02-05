import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import { Action } from '../enums/action.enum';
import { AbilityFactory } from 'src/modules/auth/ability.factory';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Hedeflenen endpoint üzerindeki @CheckPolicies içindeki aksiyonları alıyoruz
    const requiredActions = this.reflector.getAllAndOverride<Action[]>(
      CHECK_POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Eğer herhangi bir politika belirtilmemişse, erişime izin veriyoruz
    if (!requiredActions || requiredActions.length === 0) {
      return true;
    }

    if (!user) {
      return false;
    }

    // Kullanıcının rolüne göre sahip olduğu tüm yetenekleri (abilities) alıyoruz
    const userAbilities = this.abilityFactory.defineAbilities(user);

    // Eğer kullanıcı 'Manage' (Yönetici) yetkisine sahipse, her şeyi yapabilir
    if (userAbilities.includes(Action.Manage)) {
      return true;
    }

    // Gerekli TÜM aksiyonların kullanıcının yetenekleri arasında olup olmadığını kontrol ediyoruz
    const hasPermission = requiredActions.every((action) =>
      userAbilities.includes(action),
    );

    if (!hasPermission) {
      const i18n = I18nContext.current();
      const message =
        i18n?.t('common.AUTH.INSUFFICIENT_PERMISSIONS') ||
        'Bu işlem için yetkiniz bulunmamaktadır.';
      throw new ForbiddenException(message);
    }

    return true;
  }
}
