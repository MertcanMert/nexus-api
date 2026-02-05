import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  VersioningType,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/winston.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Security: Enhanced Helmet with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Performance: Compression
  app.use(compression());

  // Security: Cookie Parser
  app.use(cookieParser());

  // CORS Configuration
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction
      ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
      : true, // Development için true
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Pipe (Security & Validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if extra properties are present
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Swagger Module Integration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NexuS-API Documantion')
    .setDescription('Nexus-API Documantions for Developpers')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
}
bootstrap().catch((err) =>
  console.error(`Application failed to start: ${err}`),
);
