# 👤 User Management System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

Comprehensive user lifecycle management system with Profile support, Soft Deletion, and Admin controls.

---

## 📋 Table of Contents

- [Entity Overview](#-entity-overview)
- [User Lifecycle](#-user-lifecycle)
- [Admin Controls](#-admin-controls)
- [Profile System](#-profile-system)
- [Soft Deletion](#-soft-deletion)

---

## 🏗 Entity Overview

The User module is split into two main entities:
- **User:** Authentication and account metadata.
- **Profile:** Personal information (Name, Bio, Avatar).

### Data Relationships
- `User` 1:1 `Profile`
- `User` N:1 `Tenant`
- `User` 1:N `AuditLog`

---

## 🔄 User Lifecycle

### 1. Registration
**Endpoint:** `POST /api/v1/user`
Creates a new User, Profile, and Tenant (if standalone) in a single transaction.

```bash
curl -X POST http://localhost:3000/api/v1/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'
```

### 2. Update Profile
**Endpoint:** `PATCH /api/v1/user/:id`
**Guard:** `OwnershipGuard` (Users can only update themselves).

```bash
curl -X PATCH http://localhost:3000/api/v1/user/123... \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "profile": {
      "name": "Jane",
      "lastName": "Doe",
      "bio": "Developer"
    }
  }'
```

### 3. Soft Deletion (Self)
**Endpoint:** `PUT /api/v1/user/:id`
Marks the user as deleted (`deletedAt` is set). The user cannot login anymore.

---

## 💎 Admin Controls

The `UserAdminController` (Base path: `/api/v1/user-admin`) provides enhanced capabilities.
**Requirement:** Role must be `ADMIN`.

### 1. List Users (Pagination)
**Endpoint:** `GET /api/v1/user-admin`

Query Parameters:
- `page`: Page number (Default: 1)
- `limit`: Items per page (Default: 10)

```bash
curl -X GET "http://localhost:3000/api/v1/user-admin?page=1&limit=5" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 5,
      "totalPages": 10
    }
  }
}
```

### 2. Search by Email
**Endpoint:** `GET /api/v1/user-admin/mail/:email`
Useful for finding a specific user ID to perform actions on.

### 3. Restore User
**Endpoint:** `PATCH /api/v1/user-admin/restore/:id`
Undoes the soft-delete operation.

### 4. Hard Delete
**Endpoint:** `DELETE /api/v1/user-admin/:id`
**Warning:** This permanently removes the User and Profile from the database. Audit logs are preserved (orphaned).

---

## 🖼 Profile System

Profiles are handled as a separate entity linked to the user for better performance and clean separation of concerns.

**Supported Fields:**
- `name`, `lastName`: String(50)
- `bio`: String(500)
- `avatar`: URL to S3 storage

---

## 🗑 Soft Deletion Strategy

To preserve data integrity and historical context (Audit trails), we prefer Soft Deletes.

1.  **Delete Action:** Sets `deletedAt = NOW()`.
2.  **Prisma Middleware:** Automatically filters out records where `deletedAt IS NOT NULL` for standard queries (`findMany`, `findFirst`).
3.  **Admin Access:** `UserAdminController` uses explicit `findMany` queries that include deleted users if needed, or dedicated restoration endpoints.

---

## 📦 DTOs

### `RegisterDTO`
Email and Password. Mandatory during account creation.

### `UpdateUserDTO`
All fields are optional. Includes nested `ProfileDTO`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
