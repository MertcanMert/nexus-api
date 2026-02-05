import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDTO } from 'src/common/dto/user/register.dto';
import { UpdateUserDTO } from 'src/common/dto/user/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiQuery,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import {
  UserSchema,
  PaginatedResponseSchema,
  AuthTokensSchema,
} from '../../common/swagger/schemas';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'user', version: '1' })
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}
  /* -------------------------------------------------------------------- */

  @ApiOperation({
    summary: 'Register new user',
    description: 'Creates a new user account with email and password.',
  })
  @ApiBody({
    type: RegisterDTO,
    description: 'User registration data',
    examples: {
      newUser: {
        summary: 'New user registration',
        value: {
          email: 'newuser@example.com',
          password: 'SecurePass123!@',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        meta: {
          path: '/api/v1/users',
          method: 'POST',
          message: 'User created successfully',
          timestamp: '2026-02-05T15:30:00.000Z',
          ip: '127.0.0.1',
        },
        data: UserSchema,
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @Post()
  register(@Body() data: RegisterDTO) {
    this.logger.log(`Registering new user: ${data.email}`);
    return this.userService.register(data);
  }

  /* -------------------------------------------------------------------- */

  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user data. Requires authentication and ownership or admin role.',
  })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateUserDTO,
    description: 'User update data',
    examples: {
      updateProfile: {
        summary: 'Update user profile',
        value: {
          profile: {
            name: 'John',
            lastName: 'Doe',
            bio: 'Software Developer',
          },
        },
      },
      updatePassword: {
        summary: 'Update password',
        value: {
          password: 'NewSecurePass123!',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateUserDTO) {
    return this.userService.update(id, data);
  }

  /* -------------------------------------------------------------------- */
}
