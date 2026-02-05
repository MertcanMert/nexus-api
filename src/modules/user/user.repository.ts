import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new user with profile
   */
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, include: { profile: true } });
  }

  /**
   * Senior Approach: Transactional creation of Tenant, User, and Profile
   * Ensures data consistency for multi-tenant setup.
   */
  async createWithTenant(data: {
    email: string;
    password: string;
    tenantName: string;
  }) {
    return this.prisma.$transaction(async (tx: any) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: { name: data.tenantName },
      });

      // 2. Create User and Profile (Linked to the new Tenant)
      return tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          tenantId: tenant.id,
          profile: {
            create: {
              tenantId: tenant.id,
            },
          },
        },
        include: { profile: true },
      });
    });
  }

  /**
   * Retrieves all active users (excludes soft-deleted)
   */
  async findAll(skip: number, take: number) {
    // Optimized query with specific fields instead of include to prevent N+1
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            ID: true,
            name: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds a user by email (including soft-deleted)
   */
  async findByEmailIncludeDeleted(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds an active user by email - Optimized
   */
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        refreshToken: true,
        profile: {
          select: {
            ID: true,
            name: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });
  }

  /**
   * Counts total active users
   */
  async countAll() {
    return this.prisma.user.count({
      where: { deletedAt: null },
    });
  }

  /**
   * Finds an active user by ID
   */
  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { profile: true },
    });
  }

  /**
   * Finds a user by ID (including soft-deleted) - Admin Use Only
   */
  async findByIdIncludeDeleted(id: string) {
    return this.prisma.user.findFirst({
      where: { id },
      include: { profile: true },
    });
  }

  /**
   * Updates user data
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });
  }

  /**
   * Permanently deletes a user (Hard Delete)
   */
  async hardDelete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * Marks a user as deleted (Soft Delete)
   */
  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restores a soft-deleted user
   */
  async restore(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Updates the refresh token hash
   */
  async updateRefreshToken(id: string, token: string) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken: token },
    });
  }
}
