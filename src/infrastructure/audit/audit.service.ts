import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Projenizdeki kritik işlemleri (CREATE, UPDATE, DELETE gibi) kaydetmek için kullanılır.
   * @param auditData Loglanacak verilerin tamamı
   */
  async createLog(auditData: {
    userId?: string;
    action: string;
    resource: string;
    payload?: any;
    ipAddress?: string;
    userAgent?: string;
    tenantId?: string;
  }) {
    try {
      const data: any = {
        action: auditData.action,
        resource: auditData.resource,
        payload: auditData.payload || {},
      };

      if (auditData.userId) data.userId = auditData.userId;
      if (auditData.ipAddress) data.ipAddress = auditData.ipAddress;
      if (auditData.userAgent) data.userAgent = auditData.userAgent;
      if (auditData.tenantId) data.tenantId = auditData.tenantId;

      return await this.prisma.auditLog.create({ data });
    } catch (error) {
      this.logger.error('Audit Log kaydedilemedi:', error.message);
    }
  }

  /**
   * Belirli bir kullanıcının veya kaynağın geçmişini getirmek için (İleride admin panelinde kullanılabilir).
   */
  async getLogsByUserId(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
