import { Controller, Post, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Infrastructure / Mail')
@ApiBearerAuth('access-token')
@Controller({ path: 'mail', version: '1' })
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({
    summary: 'Send test email',
    description: 'Sends a predefined test email to a hardcoded address.',
  })
  @ApiResponse({ status: 201, description: 'Test email sent successfully' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('test-send')
  async sendTestemail() {
    await this.mailService.sendEmail(
      'mertcann.mertt@gmail.com',
      'Test Email',
      '<h1>Mail Service Çalışıyor</h1>',
    );
  }
}
