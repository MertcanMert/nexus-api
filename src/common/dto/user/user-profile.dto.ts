import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Profile DTO - User profile information
 */
@Exclude()
export class ProfileDTO {
  @ApiPropertyOptional({
    example: 'John',
    description: 'User first name',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'User last name',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({
    example: 'Software Developer passionate about building great products',
    description: 'User biography',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  @Expose()
  bio: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL',
  })
  @IsOptional()
  @IsString()
  @Expose()
  avatar: string;
}
