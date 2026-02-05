import { PickType, PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseUserDTO } from './base-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileDTO } from './user-profile.dto';

/**
 * Update User DTO - Used for updating user data
 * All fields are optional
 */
export class UpdateUserDTO extends PartialType(
  PickType(BaseUserDTO, ['email', 'password', 'role'] as const),
) {
  @ApiPropertyOptional({
    type: () => ProfileDTO,
    description: 'Profile data to update',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDTO)
  profile?: ProfileDTO;
}
