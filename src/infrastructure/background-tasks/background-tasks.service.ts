import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BackgroundTasksService {
  private readonly logger = new Logger(BackgroundTasksService.name);

  constructor(@InjectQueue('mail-queue') private readonly mailQueue: Queue) {}

  /**
   * Adds an email task to the queue
   * @param email Destination email
   * @param subject Email subject
   * @param body Email body
   */
  async addEmailTask(email: string, subject: string, body: string) {
    this.logger.log(`Adding email task to queue: ${email}`);
    await this.mailQueue.add(
      'send-email',
      {
        email,
        subject,
        body,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }

  /**
   * Adds an audit log task to the queue
   * @param data Audit log data
   */
  async addAuditLogTask(data: any) {
    await this.mailQueue.add('audit-log', data, {
      attempts: 5,
      removeOnComplete: true,
    });
  }
}
