# 🩺 System Monitoring

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Terminus](https://img.shields.io/badge/Terminus-Health_Checks-green)](https://docs.nestjs.com/recipes/terminus)

NexusAPI includes active health monitoring by `@nestjs/terminus`.

---

## 📋 Table of Contents

- [Endpoints](#-endpoints)
- [Monitored Services](#-monitored-services)
- [Implementation](#-implementation)

---

## 🚦 Endpoints

### `GET /api/v1/health`

Returns the current status of the application and its critical dependencies.

**Success Response (200):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    }
  }
}
```

**Failure Response (503):** Service Unavailable

---

## 🕵️ Monitored Services

**Verified Config:** `src/modules/health/health.controller.ts`

### 1. Database (PostgreSQL)
- **Check:** `db.pingCheck('database', prisma)`
- **Behavior:** Executes a simple `SELECT 1` query by Prisma. Fails if DB is unreachable or slow.

### 2. Memory (Heap Usage)
- **Check:** `memory.checkHeap('memory_heap', 150 * 1024 * 1024)`
- **Threshold:** **150 MB**
- **Behavior:** Fails if the Node.js process uses more than 150MB of RAM. This is critical for preventing Out-Of-Memory crashes in Docker/K8s.

---

## 💻 Implementation

The `HealthController` aggregates these checks into a single response.

```typescript
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.db.pingCheck('database', this.prisma),
    () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
  ]);
}
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
