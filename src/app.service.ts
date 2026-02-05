import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');
  getHello() {
    return {
      message: 'OK',
    };
  }
}
