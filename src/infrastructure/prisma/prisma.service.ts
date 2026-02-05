import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('PrismaService');

  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {
    const pool = new Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });

    // Senior Magic: Prisma Client Extensions
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = cls.get('TENANT_ID');
            const _args = args as any; // Type casting to bypass TS warnings

            // List of models requiring tenant isolation
            const multiTenantModels = ['User', 'AuditLog', 'Profile'];

            if (tenantId && multiTenantModels.includes(model)) {
              // Auto-inject tenantId filter into the query
              _args.where = { ..._args.where, tenantId };

              // Auto-inject tenantId during record creation (if not present)
              if (operation === 'create' || operation === 'createMany') {
                if (_args.data) {
                  if (Array.isArray(_args.data)) {
                    _args.data = _args.data.map((item: any) => ({
                      tenantId, // Default
                      ...item, // Overlay existing item data (if item has tenantId, it remains)
                    }));
                  } else {
                    _args.data = { tenantId, ..._args.data };
                  }
                }
              }
            }

            return query(_args);
          },
        },
      },
    }) as unknown as this;
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.warn('>>> DATABASE DISCONNECTED !');
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('>>> DATABASE CONNECTED !');
    } catch (e) {
      this.logger.error(`>>> DATABASE DISCONNECTED ! : ${e}`);
    }
  }
}
