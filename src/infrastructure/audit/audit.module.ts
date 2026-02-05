import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Global() // Diğer modüllerden kolayca erişebilmek için global tanımlıyoruz
@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
