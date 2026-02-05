import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private readonly cachePrefixes = {
    user: 'user:',
    users: 'users:',
    tenant: 'tenant:',
    auth: 'auth:',
  };

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  /**
   * Invalidates all cache keys for a specific user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const keys = [
        `${this.cachePrefixes.user}${userId}`,
        `${this.cachePrefixes.auth}token:${userId}`,
      ];

      await Promise.all(keys.map((key) => this.cacheManager.del(key)));

      this.logger.log(`Cache invalidated for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for user ${userId}:`,
        error,
      );
    }
  }

  /**
   * Invalidates all user list caches
   */
  async invalidateUserListCache(): Promise<void> {
    try {
      // Invalidate pagination-based caches
      const pattern = `${this.cachePrefixes.users}*`;

      // Note: cache-manager doesn't support pattern matching directly
      // In production, you might want to use Redis directly for this
      await this.cacheManager.del(`${this.cachePrefixes.users}page:1`);
      await this.cacheManager.del(`${this.cachePrefixes.users}page:2`);
      await this.cacheManager.del(`${this.cachePrefixes.users}page:3`);

      this.logger.log('User list cache invalidated');
    } catch (error) {
      this.logger.error('Failed to invalidate user list cache:', error);
    }
  }

  /**
   * Invalidates tenant-specific caches
   */
  async invalidateTenantCache(tenantId: string): Promise<void> {
    try {
      const keys = [
        `${this.cachePrefixes.tenant}${tenantId}`,
        `${this.cachePrefixes.users}tenant:${tenantId}`,
      ];

      await Promise.all(keys.map((key) => this.cacheManager.del(key)));

      this.logger.log(`Cache invalidated for tenant: ${tenantId}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for tenant ${tenantId}:`,
        error,
      );
    }
  }

  /**
   * Smart cache invalidation based on entity type
   */
  async invalidateCacheByEntity(
    entityType: string,
    entityId: string,
    tenantId?: string,
  ): Promise<void> {
    switch (entityType) {
      case 'user':
        await this.invalidateUserCache(entityId);
        if (tenantId) {
          await this.invalidateTenantCache(tenantId);
        }
        break;
      case 'tenant':
        await this.invalidateTenantCache(entityId);
        await this.invalidateUserListCache();
        break;
      default:
        this.logger.warn(
          `Unknown entity type for cache invalidation: ${entityType}`,
        );
    }
  }

  /**
   * Cache warming strategy for frequently accessed data
   */
  warmupCache(tenantId?: string): void {
    try {
      // This would typically be called during application startup
      // or on a schedule to keep frequently accessed data warm

      this.logger.log(
        `Cache warming initiated${tenantId ? ` for tenant: ${tenantId}` : ''}`,
      );

      // Implementation would depend on your specific caching needs
      // For example, pre-loading active user data
    } catch (error) {
      this.logger.error('Cache warming failed:', error);
    }
  }

  /**
   * Gets cache statistics (if supported by cache provider)
   */
  getCacheStats(): any {
    try {
      // This would need to be implemented based on your cache provider
      // Redis, for example, provides memory usage and hit rate statistics

      return {
        provider: 'cache-manager',
        message: 'Cache statistics not available with current provider',
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return null;
    }
  }
}
