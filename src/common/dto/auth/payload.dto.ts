import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Payload DTO - JWT token payload structure
 */
export class PayloadDTO {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Subject (user ID) - JWT standard claim',
  })
  sub: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    enum: Role,
    example: 'USER',
    description: 'User role',
  })
  role: Role;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Tenant ID',
  })
  tenantId: string;
}
