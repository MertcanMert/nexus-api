import { ClsModule } from 'nestjs-cls';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/winston.config';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { envValidationSchema } from './common/config/env.validation';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './infrastructure/mail/mail.module';

import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { BackgroundTasksModule } from './infrastructure/background-tasks/background-tasks.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { BullModule } from '@nestjs/bullmq';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 1. Context Handling: Enables Request-scoped storage (CLS)
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

    // 2. Configuration: Loads and validates .env variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true, // Allow extra variables in .env
        abortEarly: true, // Stop on first validation error
      },
    }),

    // 3. Logger: Replaces standard NestJS logger with Winston
    WinstonModule.forRoot(winstonConfig),

    // 4. Internationalization (i18n): Translation support
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/common/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }],
    }),

    // 5. Rate Limiting: Protection against Brute-Force/DDoS
    // Enhanced rate limiting with different limits for different endpoints
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5, // 5 attempts per minute for auth endpoints
      },
      {
        name: 'general',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute for general endpoints
      },
      {
        name: 'upload',
        ttl: 300000, // 5 minutes
        limit: 20, // 20 uploads per 5 minutes
      },
    ]),

    // 6. Caching: Redis-based global cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          database: configService.get<number>('REDIS_DB'),
          ttl: 600, // Default TTL: 10 minutes
        }),
      }),
    }),

    // 7. Background Queues: BullMQ connection setup
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: configService.get<number>('REDIS_DB'),
        },
      }),
    }),

    // Feature Modules
    PrismaModule,
    UserModule,
    AuthModule,
    MailModule,
    HealthModule,
    AuditModule,
    StorageModule,
    BackgroundTasksModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    // Global Throttler Guard (Rate Limiting)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Exception Filter (Error Handling)
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global Response Interceptor (Standard API format)
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Tenant Interceptor (Multi-tenancy context)
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    // Audit Interceptor (Activity Logging)
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    PrismaService,
  ],
})
export class AppModule {}
