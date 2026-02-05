import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseSchema {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response metadata including timestamp, path, and message',
  })
  meta: {
    path: string;
    method: string;
    message: string;
    timestamp: string;
    ip: string;
  };

  @ApiProperty({
    description: 'Response data payload',
  })
  data?: any;
}

export class ErrorSchema {
  @ApiProperty({
    example: false,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error metadata including timestamp, path, and error message',
  })
  meta: {
    path: string;
    method: string;
    message: string | string[];
    timestamp: string;
    ip: string;
  };
}

export class PaginationMeta {
  @ApiProperty({
    example: 100,
    description: 'Total number of items',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of pages',
  })
  totalPages: number;
}

export class PaginatedResponseSchema extends ApiResponseSchema {
  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMeta,
  })
  pagination: PaginationMeta;

  @ApiProperty({
    description: 'Array of items',
    type: 'array',
  })
  items: any[];
}

export class AuthTokensSchema {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (15 minutes validity)',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token (7 days validity)',
  })
  refresh_token: string;
}

export class UserProfileSchema {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile avatar URL',
  })
  avatar?: string;

  @ApiProperty({
    example: 'Software developer passionate about building great products',
    description: 'User bio/description',
  })
  bio?: string;
}

export class UserSchema {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User unique identifier (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'USER',
    description: 'User role',
    enum: ['USER', 'ADMIN', 'STAFF', 'MODERATOR'],
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'User active status',
  })
  isActive: boolean;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Tenant identifier',
  })
  tenantId: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileSchema,
  })
  profile?: UserProfileSchema;

  @ApiProperty({
    example: '2026-02-05T15:30:00.000Z',
    description: 'Account creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-02-05T15:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}

export class HealthCheckSchema {
  @ApiProperty({
    example: 'ok',
    description: 'Overall health status',
  })
  status: string;

  @ApiProperty({
    description: 'System information and metrics',
  })
  info: {
    version: string;
    uptime: number;
    timestamp: string;
    environment: string;
  };

  @ApiProperty({
    description: 'Service health details',
  })
  details: {
    database: {
      status: string;
      responseTime?: number;
    };
    redis: {
      status: string;
      responseTime?: number;
    };
    memory: {
      used: string;
      total: string;
      percentage: number;
    };
  };
}
