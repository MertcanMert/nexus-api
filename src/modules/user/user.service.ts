import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { RegisterDTO } from 'src/common/dto/user/register.dto';
import { I18nContext } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from 'src/common/constants/security.constants';
import { plainToInstance } from 'class-transformer';
import { BaseUserDTO } from 'src/common/dto/user/base-user.dto';
import { UpdateUserDTO } from 'src/common/dto/user/update-user.dto';
import { Prisma } from '@prisma/client';

import { PaginationDTO } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Registers a new user
   * @param data Registration data
   * @returns Created user data
   */
  async register(data: RegisterDTO) {
    this.logger.log(`Registering new user: ${data.email}`);
    const i18n = I18nContext.current();

    const userExist = await this.userRepo.findByEmail(data.email);

    if (userExist) {
      const message =
        i18n?.t('common.USER.ALREADY_EXISTS', {
          args: { name: userExist.email },
        }) || `${userExist.email} already exists`;
      this.logger.warn(
        `Registration failed - user already exists: ${data.email}`,
      );
      throw new ConflictException(message);
    }

    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Senior Approach: Use a transaction to ensure Tenant and User are created together
    const result = await this.userRepo.createWithTenant({
      email: data.email,
      password: hashedPassword,
      tenantName: `${data.email.split('@')[0]}'s Organization`,
    });

    this.logger.log(`User registered successfully: ${data.email}`);
    const { role, ...newUser } = result;

    return plainToInstance(BaseUserDTO, newUser);
  }

  /**
   * Retrieves all active users with pagination
   * @param pagination Pagination parameters
   * @returns Paginated list of users
   */
  async findAll(pagination: PaginationDTO) {
    this.logger.log(
      `Fetching users page ${pagination.page} (limit: ${pagination.limit})`,
    );

    // Optimized single query with count
    const [users, total] = await Promise.all([
      this.userRepo.findAll(pagination.skip, pagination.limit!),
      this.userRepo.countAll(),
    ]);

    this.logger.log(`Found ${users.length} users out of ${total}`);

    return {
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit!),
      },
      items: plainToInstance(BaseUserDTO, users),
    };
  }

  /**
   * Retrieves a user by email
   * @param email User email
   * @returns User data
   */
  async getUserByEmail(email: string) {
    this.logger.log(`Fetching user by email: ${email}`);
    const i18n = I18nContext.current();

    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      const message = i18n?.t('common.USER.NOT_FOUND') || 'User not found';
      this.logger.warn(`User not found by email: ${email}`);
      throw new NotFoundException(message);
    }

    this.logger.log(`User found: ${email}`);
    return plainToInstance(BaseUserDTO, user);
  }

  /**
   * Retrieves a user by ID (including soft-deleted)
   * @param id User ID
   * @returns User data
   */
  async findByIdIncludeDeleted(id: string) {
    this.logger.log(`Fetching user by ID: ${id}`);
    const i18n = I18nContext.current();

    const user = await this.userRepo.findByIdIncludeDeleted(id);

    if (!user) {
      const message = i18n?.t('common.USER.NOT_FOUND') || 'User not found';
      this.logger.warn(`User not found by ID: ${id}`);
      throw new NotFoundException(message);
    }

    this.logger.log(`User found: ${id}`);
    return plainToInstance(BaseUserDTO, user);
  }

  /**
   * Updates user data
   * @param id User ID
   * @param data Update data
   * @returns Updated user data
   */
  async update(id: string, data: UpdateUserDTO) {
    this.logger.log(`Updating user: ${id}`);
    const i18n = I18nContext.current();

    const { profile, password, ...userData } = data;

    const hasUserData = Object.values(userData).some((v) => v !== undefined);
    const hasPassword =
      password !== undefined && password !== null && password !== '';
    const hasProfile =
      profile &&
      Object.values(profile).some((v) => v !== undefined && v !== null);

    if (!hasProfile && !hasPassword && !hasUserData) {
      const message =
        i18n?.t('common.VALIDATION.AT_LEAST_ONE_FIELD') ||
        'At least one field must be provided';
      this.logger.warn(`Update failed - no data provided for user: ${id}`);
      throw new BadRequestException(message);
    }

    const prismaPayload: Prisma.UserUpdateInput = {
      ...userData,
    };

    if (password) {
      this.logger.log(`Updating password for user: ${id}`);
      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
      prismaPayload.password = await bcrypt.hash(password, salt);
    }

    if (profile) {
      this.logger.log(`Updating profile for user: ${id}`);
      prismaPayload.profile = {
        update: { ...profile },
      };
    }

    const updateUser = await this.userRepo.update(id, prismaPayload);
    this.logger.log(`User updated successfully: ${id}`);
    return plainToInstance(BaseUserDTO, updateUser);
  }

  /**
   * Soft deletes a user (marks as deleted)
   * @param id User ID
   * @returns Deleted user data
   */
  async softDelete(id: string) {
    this.logger.log(`Soft deleting user: ${id}`);
    const i18n = I18nContext.current();

    const existingUser = await this.userRepo.findById(id);

    if (!existingUser) {
      const message = i18n?.t('common.USER.NOT_FOUND') || 'User not found';
      this.logger.warn(`Soft delete failed - user not found: ${id}`);
      throw new NotFoundException(message);
    }

    const deletedUser = await this.userRepo.softDelete(id);
    this.logger.log(`User soft deleted successfully: ${id}`);

    return plainToInstance(BaseUserDTO, deletedUser);
  }

  /**
   * Permanently deletes a user
   * @param id User ID
   * @returns Deleted user data
   */
  async hardDelete(id: string) {
    this.logger.log(`Hard deleting user: ${id}`);
    const i18n = I18nContext.current();

    try {
      const deletedUser = await this.userRepo.hardDelete(id);
      this.logger.log(`User hard deleted successfully: ${id}`);
      return plainToInstance(BaseUserDTO, deletedUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          const message = i18n?.t('common.USER.NOT_FOUND') || 'User not found';
          throw new NotFoundException(message);
        }
      }
      const message =
        i18n?.t('common.ERROR.DELETE_FAILED') || 'Delete operation failed';
      throw new BadRequestException(message);
    }
  }

  /**
   * Restores a soft-deleted user
   * @param id User ID
   * @returns Restored user data
   */
  async restoreSoftDelete(id: string) {
    this.logger.log(`Restoring soft-deleted user: ${id}`);
    const i18n = I18nContext.current();

    const user = await this.userRepo.findById(id);

    if (!user) {
      const message = i18n?.t('common.USER.NOT_FOUND') || 'User not found';
      this.logger.warn(`Restore failed - user not found: ${id}`);
      throw new NotFoundException(message);
    }

    if (user.deletedAt === null) {
      const message =
        i18n?.t('common.USER.ALREADY_ACTIVE') || 'User already active';
      this.logger.warn(`Restore failed - user already active: ${id}`);
      throw new BadRequestException(message);
    }

    const restoredUser = await this.userRepo.restore(id);
    this.logger.log(`User restored successfully: ${id}`);

    return plainToInstance(BaseUserDTO, restoredUser);
  }

  /**
   * Updates user's refresh token
   * @param id User ID
   * @param refreshToken New refresh token
   * @returns Updated user data
   */
  async updateRefreshToken(id: string, refreshToken: string) {
    this.logger.log(`Updating refresh token for user: ${id}`);
    const i18n = I18nContext.current();

    const user = await this.userRepo.findById(id);

    if (!user) {
      const message =
        i18n?.t('common.USER.REFRESH_TOKEN_UPDATE_FAILED') ||
        'Refresh token update failed';
      this.logger.error(`Refresh token update failed - user not found: ${id}`);
      throw new NotFoundException(message);
    }

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      BCRYPT_SALT_ROUNDS,
    );
    const updatedUser = await this.userRepo.updateRefreshToken(
      id,
      hashedRefreshToken,
    );
    this.logger.log(`Refresh token updated successfully for user: ${id}`);
    return plainToInstance(BaseUserDTO, updatedUser);
  }
}
