import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('Infrastructure / Storage')
@ApiBearerAuth('access-token')
@Controller({ path: 'storage', version: '1' })
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({
    summary: 'Upload file (Test)',
    description: 'Uploads a file to S3 and returns the public URL.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        success: true,
        url: 'https://cdn.nexus.com/uploads/guid-filename.jpg',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'No file uploaded or invalid format' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya seçilmedi.');
    }

    this.logger.log(`Received file upload request: ${file.originalname}`);
    const url = await this.storageService.uploadFile(file, 'test-uploads');

    return {
      success: true,
      url,
    };
  }
}
