# 📜 NexusAPI Audit Logging System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://bullmq.io/)

A high-performance, asynchronous auditing system that tracks every data-modifying operation within the application.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [How it Works](#-how-it-works)
- [Audit Interceptor](#-audit-interceptor)
- [Asynchronous Processing](#-asynchronous-processing)
- [Captured Metadata](#-captured-metadata)

---

## 🏗 Overview

The `AuditModule` is designed to provide full traceability for sensitive actions. It records who did what, when, and from where.

### Key Goals
- **Accountability:** Track user actions.
- **Security:** Detect unauthorized attempts or suspicious patterns.
- **Traceability:** View historical changes to resources.

---

## ⚡ How it Works

The system uses a **Global Interceptor** combined with **Background Workers**:

1. **Request Phase:** `AuditInterceptor` captures the request details.
2. **Execution:** The actual controller method runs.
3. **Queue Phase:** If successful, the interceptor pushes log data to **BullMQ (Redis)**.
4. **Processing Phase:** `AuditLogProcessor` picks up the task and saves it to PostgreSQL.

---

## 🛠 Audit Interceptor
**File:** `src/common/interceptors/audit.interceptor.ts`

The interceptor captures request metadata **after** the handler executes successfully (using RxJS `tap`).

### 1. Scope (Verified)
It purely logs **Data Mutation** methods. Read operations are excluded to save storage space.
- ✅ `POST`
- ✅ `PUT`
- ✅ `PATCH`
- ✅ `DELETE`
- ❌ `GET` (Ignored)

### 2. Data Sanitization (Verified)
Before sending the payload to the database, sensitive fields are automatically masked to protect user privacy.

**Masked Fields:**
- `password` -> `********`

### 3. Asynchronous Pipeline
The interceptor delegates the heavy lifting to the `BackgroundTasksService`. This ensures the API response time remains unaffected by the database write operation.

---

## ⚙️ Asynchronous Processing

**Queue:** `mail-queue` (Reused for audit logs for simplicity, or split in production).
**Processor:** `AuditLogProcessor`

1.  Interceptor calls `addAuditLogTask()`.
2.  Task is serialized to Redis.
3.  `AuditLogProcessor` picks it up and writes to `Prisma.AuditLog`.

---

## 📊 Captured Metadata

Each `AuditLog` entry contains:

| Field | Description |
|-------|-------------|
| **action** | HTTP Method + Path (e.g., `POST /api/v1/auth/login`) |
| **resource** | The target entity / controller |
| **userId** | ID of the user who performed the action |
| **tenantId** | The tenant context |
| **payload** | The request body (sanitized) |
| **ipAddress** | Client IP |
| **userAgent** | Client browser/app info |
| **createdAt** | Precise timestamp |

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
