import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Security Priority:
    // 1. Authenticated user's tenantId (Immutable, from JWT)
    // 2. Header (x-tenant-id) - Only for unauthenticated or multi-tenant admin requests
    const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];

    if (tenantId) {
      this.cls.set('TENANT_ID', tenantId);
    }

    return next.handle();
  }
}
