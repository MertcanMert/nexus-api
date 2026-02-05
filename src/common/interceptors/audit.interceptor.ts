import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BackgroundTasksService } from 'src/infrastructure/background-tasks/background-tasks.service';

import type { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly backgroundTasksService: BackgroundTasksService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, user, ip } = request;
    const userAgent = request.get('user-agent') || '';

    // Only log state-changing methods (Mutation)
    // GET requests are excluded to reduce log volume
    const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    return next.handle().pipe(
      tap({
        next: (data) => {
          if (sensitiveMethods.includes(method)) {
            // Sanitize sensitive data (e.g., passwords) before logging
            const payload = { ...body };
            if (payload.password) payload.password = '********';

            const action = `${method}_${url.split('/').pop()?.toUpperCase() || 'ACTION'}`;
            const resource = url.split('/')[2] || 'Global';

            // Tenant Resolution Strategy:
            // 1. Authenticated user's tenant (from JWT)
            // 2. Response data (for new registrations)
            const tenantId = (user as any)?.tenantId || data?.tenantId;

            this.backgroundTasksService
              .addAuditLogTask({
                userId: (user as any)?.userId,
                action,
                resource,
                payload,
                ipAddress: ip,
                userAgent,
                tenantId,
              })
              .catch((err) =>
                this.logger.error('Failed to add audit log task', err),
              );

            this.logger.log(
              `Audit Log: ${method} ${url} by user ${(user as any)?.userId || 'ANONYMOUS'} (Tenant: ${tenantId || 'SYSTEM'})`,
            );
          }
        },
      }),
    );
  }
}
