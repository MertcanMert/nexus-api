import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AuditService } from '../audit/audit.service';

@Processor('mail-queue') // Using existing queue for simplicity, or create a new one
export class AuditLogProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(private readonly auditService: AuditService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'audit-log') {
      this.logger.log(`Processing async audit log for job: ${job.id}`);
      try {
        await this.auditService.createLog(job.data);
      } catch (error) {
        this.logger.error(`Failed to save async audit log: ${error.message}`);
        throw error;
      }
    }
  }
}
