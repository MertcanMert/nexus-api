import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { AbilityFactory } from './ability.factory';

function toExpiresIn(
  value: string | undefined,
  fallback: JwtSignOptions['expiresIn'],
): JwtSignOptions['expiresIn'] {
  if (!value) return fallback;
  const v = value.trim();
  if (/^\d+$/.test(v)) return Number(v);
  if (/^\d+(ms|s|m|h|d|w|y)$/i.test(v)) return v as StringValue;
  return fallback;
}

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.getOrThrow<string>('JWT_SECRET');
        const expiresIn = configService.getOrThrow<string>(
          'JWT_EXPIRES_IN_ACCESS_TOKEN',
        );

        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }

        return {
          secret,
          signOptions: {
            expiresIn: toExpiresIn(expiresIn, '15m'),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, AbilityFactory],
  exports: [AbilityFactory],
})
export class AuthModule {}
