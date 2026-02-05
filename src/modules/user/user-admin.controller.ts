import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UserService } from './user.service';
import { UpdateUserDTO } from 'src/common/dto/user/update-user.dto';
import { PaginationDTO } from 'src/common/dto/pagination.dto';

@ApiTags('Admin / Users')
@ApiBearerAuth('access-token')
@Controller({ path: 'user-admin', version: '1' })
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RoleGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserAdminController {
  private readonly logger = new Logger('UserAdminController');
  constructor(private readonly userService: UserService) {}

  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Get all users with pagination',
    description: 'Retrieves active users with pagination support.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          items: [
            {
              id: 'uuid-string',
              email: 'user@example.com',
              profile: {
                name: 'John',
                lastName: 'Doe',
              },
              createdAt: '2026-02-02T00:00:00.000Z',
              updatedAt: '2026-02-02T00:00:00.000Z',
            },
          ],
          pagination: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10,
          },
        },
      },
    },
  })
  @Get()
  findAll(@Query() pagination: PaginationDTO) {
    return this.userService.findAll(pagination);
  }
  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Retrieves a specific user by their email address.',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'user@example.com',
  })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('mail/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }
  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their unique ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 'uuid-string',
          email: 'user@example.com',
          profile: {
            name: 'John',
            lastName: 'Doe',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findByIdIncludeDeleted(id);
  }
  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user data. Requires authentication and ownership or admin role.',
  })
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
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateUserDTO) {
    return this.userService.update(id, data);
  }
  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Soft delete user',
    description:
      'Marks a user as deleted without removing from database. Requires authentication and ownership or admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Put(':id')
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.softDelete(id);
  }
  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Hard delete user (Admin only)',
    description:
      'Permanently removes a user from the database. Requires ADMIN role.',
  })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete(':id')
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.hardDelete(id);
  }
  /* -------------------------------------------------------------------- */
  @ApiOperation({
    summary: 'Restore soft-deleted user',
    description:
      'Restores a previously soft-deleted user account. Requires ADMIN role.',
  })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'User already active' })
  @Patch('restore/:id')
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.restoreSoftDelete(id);
  }
  /* -------------------------------------------------------------------- */
}
