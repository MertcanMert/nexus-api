import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client';
import { PASSWORD_REGEX } from '../../constants/security.constants';

/**
 * Register DTO - Used for new user registration
 * Enhanced with comprehensive validation for security
 */
export class RegisterDTO {
  @ApiProperty({
    example: 'user@nexus-api.com',
    description: 'User unique email address',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Strong password with complexity requirements',
    minLength: 12,
  })
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'USER',
    description: 'User role (defaults to USER if not specified)',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
