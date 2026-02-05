import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO } from 'src/common/dto/auth/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { I18nContext } from 'nestjs-i18n';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns the authenticated user information from the JWT token.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    schema: {
      example: {
        userId: 'uuid-string',
        email: 'user@example.com',
        role: 'USER',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing token',
    schema: {
      example: {
        success: false,
        statusCode: 401,
        meta: {
          path: '/api/v1/auth/me',
          method: 'GET',
          message: 'Invalid or missing token! Please log in.',
          timestamp: '2026-02-02T00:00:00.000Z',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: AuthenticatedUser }) {
    this.logger.log(`Get me request from user: ${req.user?.userId}`);
    return req.user;
  }

  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user credentials and returns JWT tokens. Enhanced security with rate limiting (5 attempts per minute) and email enumeration protection.',
  })
  @ApiBody({
    type: LoginDTO,
    description: 'User credentials',
    examples: {
      validCredentials: {
        summary: 'Valid login credentials',
        value: {
          email: 'user@example.com',
          password: 'SecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        meta: {
          path: '/api/v1/auth/login',
          method: 'POST',
          message: 'Request successful',
          timestamp: '2026-02-02T00:00:00.000Z',
        },
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid credentials - Generic error message prevents email enumeration attacks',
    schema: {
      example: {
        success: false,
        statusCode: 401,
        meta: {
          path: '/api/v1/auth/login',
          method: 'POST',
          message: 'Invalid credentials',
          timestamp: '2026-02-02T00:00:00.000Z',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`Login attempt for user: ${loginDTO.email}`);

    const user = await this.authService.validateUser(
      loginDTO.email,
      loginDTO.password,
    );

    this.logger.log(`Login successful for user: ${loginDTO.email}`);

    const tokens = await this.authService.login({
      id: user.id,
      email: user.email,
      role: user.role,
      sub: user.id,
      tenantId: (user as any).tenantId,
    });

    // Set Cookies
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins (matching JWT_EXPIRES_IN_ACCESS_TOKEN)
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching JWT_EXPIRES_IN_REFRESH_TOKEN)
    });

    return tokens;
  }

  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Generates new access and refresh tokens using a valid refresh token.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        meta: {
          path: '/api/v1/auth/refresh',
          method: 'POST',
          message: 'Request successful',
          timestamp: '2026-02-02T00:00:00.000Z',
        },
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        success: false,
        statusCode: 401,
        meta: {
          path: '/api/v1/auth/refresh',
          method: 'POST',
          message: 'Access Denied',
          timestamp: '2026-02-02T00:00:00.000Z',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`Token refresh request from user: ${user?.userId}`);
    if (!user.refreshToken) {
      const i18n = I18nContext.current();
      const message =
        i18n?.t('common.AUTH.TOKEN_MISSING') || 'Refresh token is missing';
      throw new UnauthorizedException(message);
    }
    const tokens = await this.authService.refresh(
      user.userId,
      user.refreshToken,
    );

    // Set New Cookies
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  @ApiOperation({
    summary: 'User logout',
    description: 'Clears authentication cookies.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
}
