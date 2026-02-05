import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProfileDTO } from './user-profile.dto';

/**
 * Base User DTO - Used for user data transfer
 * Contains all user properties with validation and transformation rules
 */
export class BaseUserDTO {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User unique identifier (UUID)',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'user@nexus-api.com',
    description: 'User unique email address',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  @Expose()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'Password must be at least 8 characters with uppercase, lowercase, number and special character',
    minLength: 8,
  })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Expose()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiPropertyOptional({
    enum: Role,
    enumName: 'Role',
    example: 'USER',
    description: 'User role for access control',
    default: 'USER',
  })
  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  @Expose()
  @Exclude({ toPlainOnly: true })
  role: Role;

  @ApiPropertyOptional({
    description: 'Hashed refresh token for token renewal',
    example: null,
  })
  @IsString()
  @IsOptional()
  @Expose()
  @Exclude({ toPlainOnly: true })
  refreshToken: string;

  @IsBoolean()
  @Expose()
  isActive: boolean;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Tenant ID',
  })
  @Expose()
  tenantId: string;

  @ApiPropertyOptional({
    type: () => ProfileDTO,
    description: 'User profile information',
  })
  @Expose()
  @Type(() => ProfileDTO)
  profile: ProfileDTO;

  @ApiProperty({
    example: '2026-02-02T00:00:00.000Z',
    description: 'Account creation timestamp',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-02T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  @Expose()
  updatedAt: Date;
}
