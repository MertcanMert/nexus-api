import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PayloadDTO } from 'src/common/dto/auth/payload.dto';
import { UserRepository } from '../user/user.repository';
import { I18nContext } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates user credentials
   * @param email User email
   * @param pass Plain text password
   * @returns User data without password
   */
  async validateUser(email: string, pass: string) {
    this.logger.log(`Attempting to validate user: ${email}`);
    const i18n = I18nContext.current();

    try {
      const user = await this.userService.getUserByEmail(email);
      const isMatch = await bcrypt.compare(pass, user.password);

      if (!isMatch) {
        const message =
          i18n?.t('common.AUTH.INVALID_CREDENTIALS') || 'Invalid credentials';
        this.logger.warn(`Invalid credentials for user: ${email}`);
        throw new UnauthorizedException(message);
      }

      this.logger.log(`User validated successfully: ${email}`);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      // Prevent email enumeration by using consistent error message
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const message =
        i18n?.t('common.AUTH.INVALID_CREDENTIALS') || 'Invalid credentials';
      this.logger.warn(`Validation failed for email: ${email}`);
      throw new UnauthorizedException(message);
    }
  }

  /**
   * Generates JWT tokens for authenticated user
   * @param user User payload data
   * @returns Access and refresh tokens
   */
  async login(user: PayloadDTO) {
    const { id: sub, email, role, tenantId } = user;

    this.logger.log(
      `Generating tokens for user: ${email} (Tenant: ${tenantId})`,
    );

    const payload = {
      sub,
      email,
      role,
      tenantId, // Critical for Multi-tenancy
    };

    const accessTokenSecret =
      this.configService.getOrThrow<string>('JWT_SECRET');
    const accessTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_EXPIRES_IN_ACCESS_TOKEN',
    );
    const refreshTokenSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_EXPIRES_IN_REFRESH_TOKEN',
    );

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new InternalServerErrorException('JWT secrets are not configured');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: toExpiresIn(accessTokenExpiresIn, '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: toExpiresIn(refreshTokenExpiresIn, '7d'),
    });

    await this.userService.updateRefreshToken(sub, refreshToken);

    this.logger.log(`Tokens generated successfully for user: ${email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Refreshes JWT tokens using a valid refresh token
   * @param userId User ID from token
   * @param refreshToken Current refresh token
   * @returns New access and refresh tokens
   */
  async refresh(userId: string, refreshToken: string) {
    const i18n = I18nContext.current();

    if (!userId) {
      const message = i18n?.t('common.AUTH.REFRESH_FAILED') || 'Refresh failed';
      this.logger.error('Refresh failed: userId is undefined');
      throw new UnauthorizedException(message);
    }

    this.logger.log(`Attempting to refresh token for user: ${userId}`);

    const user = await this.userRepo.findById(userId);

    if (!user || !user.refreshToken) {
      const message = i18n?.t('common.AUTH.ACCESS_DENIED') || 'Access Denied';
      this.logger.error(
        `Access Denied: User or token not found. User Found: ${!!user}, Token Found: ${!!user?.refreshToken}`,
      );
      throw new UnauthorizedException(message);
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatch) {
      // Immediately invalidate all tokens on refresh token mismatch
      await this.userService.updateRefreshToken(userId, '' as any);

      const message = i18n?.t('common.AUTH.TOKEN_MISMATCH') || 'Token Mismatch';
      this.logger.error(
        `Token mismatch for user: ${userId} - all tokens invalidated`,
      );
      throw new UnauthorizedException(message);
    }

    this.logger.log(`Token refreshed successfully for user: ${userId}`);

    // Invalidate old refresh token before issuing new ones
    await this.userService.updateRefreshToken(userId, '' as any);

    const payload: PayloadDTO = {
      id: user.id,
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId, // Type-safe access to tenantId
    };

    return this.login(payload);
  }
}
