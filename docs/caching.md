# ⚡ Caching Strategy (Redis)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

NexusAPI uses a global **Redis-based** caching strategy to optimize performance.

---

## 📋 Table of Contents

- [Configuration](#-configuration)
- [Global Cache Settings](#-global-cache-settings)
- [Usage (Interceptor)](#-usage-interceptor)
- [Usage (Service)](#-usage-service)

---

## ⚙️ Configuration

**Verified Config:** `src/app.module.ts`

The cache module uses `cache-manager-redis-yet` store for high performance.

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...
REDIS_DB=0
```

---

## 🌍 Global Cache Settings

- **Default TTL:** 600 seconds (10 Minutes)
- **Max Items:** Unlimited (Redis controls eviction)
- **Scope:** Global (`isGlobal: true`)

---

## 🚀 Usage (Interceptor)

**Recommended** for GET endpoints.
Automatically caches the entire HTTP response based on the URL.

```typescript
@Controller('products')
@UseInterceptors(CacheInterceptor) // 1. Enable Caching
export class ProductsController {
  
  @Get()
  @CacheTTL(30) // 2. Override TTL (30 seconds)
  findAll() {
    return this.service.findAll();
  }
}
```

---

## 💾 Usage (Service)

Inject `CACHE_MANAGER` to manually set/get keys.

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

async getHeavyData() {
  // 1. Check Cache
  const cached = await this.cacheManager.get('my-key');
  if (cached) return cached;

  // 2. Compute
  const data = await db.query(...);

  // 3. Set Cache (TTL 1 minute)
  await this.cacheManager.set('my-key', data, 60000);
  
  return data;
}
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
