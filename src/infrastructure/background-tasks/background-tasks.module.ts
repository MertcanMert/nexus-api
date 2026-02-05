import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BackgroundTasksService } from './background-tasks.service';
import { MailProcessor } from './mail.processor';
import { AuditLogProcessor } from './audit-log.processor';
import { MailModule } from '../mail/mail.module';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
    MailModule,
    AuditModule,
  ],
  providers: [BackgroundTasksService, MailProcessor, AuditLogProcessor],
  exports: [BackgroundTasksService],
})
export class BackgroundTasksModule {}
