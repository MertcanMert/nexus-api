import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';
import { getSystemMetaData } from '../config/winston.config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly i18n: I18nService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    // Determine HTTP Status
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    const lang = (request as { i18nLang?: string }).i18nLang || 'en';
    let message: string | string[] = await this.i18n.translate(
      'common.INTERNAL_SERVER_ERROR',
      { lang },
    );

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string };

      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as { message?: string | string[] }).message!;
      } else if (typeof res === 'object' && res !== null && 'error' in res) {
        message = (res as { error?: string }).error || 'Error';
      } else {
        message = res as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      meta: {
        path: request.url,
        method: request.method,
        message,
        timestamp: new Date().toISOString(),
        ip: request.ip ?? 'unknown',
      },
    };

    if (status >= (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(
        `CRITICAL_ERROR : [ ${request.method} ] - ${request.url}`,
        {
          stack: exception instanceof Error ? exception.stack : 'NO STACK',
          ...getSystemMetaData(),
        },
      );
    }

    response.status(status).json(errorResponse);
  }
}
