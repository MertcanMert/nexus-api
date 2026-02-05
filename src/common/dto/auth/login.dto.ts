import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/swagger';
import { BaseUserDTO } from '../user/base-user.dto';

/**
 * Login DTO - Used for user authentication
 * Picks only email and password from BaseUserDTO
 */
export class LoginDTO extends PickType(BaseUserDTO, [
  'email',
  'password',
] as const) {}
