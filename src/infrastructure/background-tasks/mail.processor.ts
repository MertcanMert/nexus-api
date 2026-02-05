import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-email': {
        const { email, subject, body } = job.data;
        this.logger.log(`Sending email to ${email} by background worker...`);

        try {
          // Actual mail sending by Nodemailer transporter
          await this.mailService.sendEmail(email, subject, body);
          this.logger.log(`Email successfully sent to ${email}`);
        } catch (error) {
          this.logger.error(
            `Failed to send email to ${email}: ${error.message}`,
          );
          throw error; // BullMQ retry
        }
        break;
      }

      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }
}
