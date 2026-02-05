# 📄 Pagination, Sorting & Filtering

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

NexusAPI provides a consistent interface for consuming list endpoints.

---

## 📋 Table of Contents

- [Pagination](#-pagination)
- [Filtering](#-filtering)
- [Sorting](#-sorting)
- [Usage in Code](#-usage-in-code)

---

## 🔢 Pagination

We use **Offset-based Pagination**.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | 1 | The current page number (1-based index). |
| `limit` | `number` | 10 | Number of items per page (Max 100). |

### Request Example
```http
GET /api/v1/user-admin?page=2&limit=20
```

### Response Example
The `TransformInterceptor` does not automatically add pagination meta (yet). The controller returns it explicitly.

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 🔍 Filtering

Simple filtering is supported by query parameters.

### User Search
The `UserAdminController` supports searching by email.

```http
GET /api/v1/user-admin?search=john.doe
```
*Implementation:* Uses `contains` operator (partial match) on the email field.

---

## 💻 Usage in Code
**File:** `src/common/dto/pagination.dto.ts`

### DTO Definition
The DTO automatically calculates the `skip` value needed for Prisma/TypeORM, keeping controllers clean.

```typescript
export class PaginationDTO {
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Max(100)
  limit?: number = 10;

  // 🪄 Magic getter for ORM
  get skip(): number {
    return ((this.page - 1) * this.limit);
  }
}
```

### Controller Implementation
Simply inject the DTO by `@Query()`. The transform pipe converts strings to numbers automatically.

```typescript
@Get()
findAll(@Query() pagination: PaginationDTO) {
  // pagination.skip is ready to use!
  return this.prisma.user.findMany({
    skip: pagination.skip,
    take: pagination.limit
  });
}
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
