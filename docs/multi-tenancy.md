# 🏢 NexusAPI Multi-Tenancy System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

NexusAPI implements a **SaaS-ready Multi-Tenancy** architecture using a single-database, shared-schema approach with **logical isolation** at the database layer.

---

## 📋 Table of Contents

- [Core Concept](#-core-concept)
- [How It Works](#-how-it-works)
- [Database Strategy](#-database-strategy)
- [Request Lifecycle](#-request-lifecycle)
- [Security & Isolation](#-security--isolation)

---

## 🏗 Core Concept

The system is designed to host multiple independent organizations (Tenants) within a single infrastructure. Every user belongs to exactly one tenant, and data visibility is strictly restricted to that tenant.

| Entity | Relation |
|--------|----------|
| **Tenant** | Top-level organization unit |
| **User** | Belongs to one Tenant |
| **Data** | Linked to a `tenantId` (User, Profile, AuditLog, etc.) |

---

## ⚡ How It Works

NexusAPI uses a two-step isolation process:

### 1. Context Capture (`TenantInterceptor`)

Every request passes through the `TenantInterceptor`, which determines the active tenant context safely.

**Security Priority logic (Verified in `src/common/interceptors/tenant.interceptor.ts`):**

1.  **Authenticated Requests:**
    *   The `tenantId` is extracted from the **JWT Payload** (`request.user.tenantId`).
    *   This is **Immutable**. A user cannot spoof their tenant ID by sending a header.
2.  **Public/System Requests:**
    *   If no user is logged in, the system checks the `x-tenant-id` HTTP Header.
    *   Useful for public endpoints like "Contact Us" forms or Login pages specific to a tenant.
3.  **Storage:**
    *   The ID is stored in **AsyncLocalStorage (CLS)** under the key `TENANT_ID`.
    *   It remains available throughout the request lifecycle (Service -> Repository -> Prisma).

### 2. Database Filter (`Prisma Extension`)
The `PrismaService` uses a global query extension.

*   **Read Operations (`findMany`, `findFirst`, `count`):** Automatically appends `{ where: { tenantId: '...' } }`.
*   **Write Operations (`create`, `createMany`):** Automatically injects `data: { tenantId: '...' }`.

---

## 🗄 Database Strategy

We use a **Shared Database / Shared Schema** strategy. This is the most cost-effective and scalable approach for many SaaS applications.

### Isolation Layers:

1.  **Logical Isolation:** Prisma Extension ensures a WHERE clause exists on every query.
2.  **Context Isolation:** `nestjs-cls` ensures request contexts never leak into each other (Thread-safe).

---

## 🔄 Request Lifecycle

```
Client Request
    │
    ▼
┌──────────────────────┐
│  JwtAuthGuard        │ (Verify Identity)
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  TenantInterceptor   │ (Set TENANT_ID in CLS)
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Controller/Service  │ (Generic Business Logic)
└──────────────────────┘
    │
    ▼
┌──────────────────────┐
│  Prisma Service      │ (Apply WHERE tenantId = '...')
└──────────────────────┘
    │
    ▼
Database Result (Isolated)
```

---

## 🔒 Security & Isolation

### Data Leakage Prevention
Even if a developer forgets to filter by `tenantId` in the service layer, the **Prisma Extension** acts as a safety net, ensuring that no tenant can ever see another's data.

### Global Entities
Entities that are not multi-tenant (e.g., system configuration) bypass the filter by being excluded from the `multiTenantModels` list in `PrismaService`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
