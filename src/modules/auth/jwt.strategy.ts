import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    const logger = new Logger('JwtStrategyDebug');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          if (headerToken) {
            logger.debug(
              `Extracted from Header: [${headerToken.substring(0, 10)}...]`,
            );
          }
          return headerToken;
        },
        (req: any) => {
          const cookieToken = req?.cookies?.access_token;
          if (cookieToken) {
            logger.debug(
              `Extracted from Cookie: [${cookieToken.substring(0, 10)}...]`,
            );
          }
          return cookieToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: any): AuthenticatedUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
