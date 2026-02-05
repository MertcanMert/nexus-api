import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const secret = configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const logger = new Logger('JwtRefreshStrategyDebug');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          if (headerToken) {
            logger.debug(
              `Extracted Refresh from Header: [${headerToken.substring(0, 10)}...]`,
            );
          }
          return headerToken;
        },
        (req: any) => {
          const cookieToken = req?.cookies?.refresh_token;
          if (cookieToken) {
            logger.debug(
              `Extracted Refresh from Cookie: [${cookieToken.substring(0, 10)}...]`,
            );
          }
          return cookieToken;
        },
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    let refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      refreshToken = req.headers.authorization?.replace('Bearer ', '').trim();
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      refreshToken,
    };
  }
}
