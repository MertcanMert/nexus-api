# 📏 NexusAPI Standards & Best Practices

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-Swagger-green)](https://swagger.io/)

This document defines the API standards for Request/Response cycles, Error Handling, and Validation.

---

## 📋 Table of Contents

- [Response Format](#-response-format)
- [Error Handling](#-error-handling)
- [Validation & DTOs](#-validation--dtos)
- [Swagger Documentation](#-swagger-documentation)

---

## 📨 Response Format

All successful responses are automatically wrapped by the `TransformInterceptor`. This ensures a consistent structure across the entire API.

**Standard Structure:**
```json
{
  "success": true,
  "statusCode": 200,
  "meta": {
    "timestamp": "2026-02-04T00:00:00.000Z",
    "path": "/api/v1/user",
    "method": "GET"
  },
  "data": { ... } // Your actual return value goes here
}
```

**Developer Usage:**
You simply return the data object from your controller. The interceptor handles the wrapping.

```typescript
@Get()
findAll() {
  return [user1, user2]; // Automatically becomes { success: true, data: [...] }
}
```

---

## ❌ Error Handling

The `AllExceptionsFilter` catches all thrown exceptions (HTTP or System errors) and formats them consistently.

**Error Structure:**
```json
{
  "success": false,
  "statusCode": 400,
  "meta": {
    "timestamp": "2026-02-04T00:00:00.000Z",
    "path": "/api/v1/auth/login",
    "message": ["password must be longer than or equal to 8 characters"] // Array or String
  }
}
```

---

## 📦 Validation & DTOs

We use `class-validator` and `class-transformer`.

**Strict Rules:**
- `whitelist: true`: Properties not in the DTO are stripped.
- `forbidNonWhitelisted: true`: Requests with unknown properties are rejected (400 Bad Request).
- `transform: true`: Automatically converts primitives (e.g., query params string "1" -> number 1).

**Example DTO:**
```typescript
export class CreateUserDTO {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

---

## 📜 Swagger Documentation

We use `@nestjs/swagger` to generate OpenAPI specs.

**Best Practices:**
1. **Tags:** Use `@ApiTags('Feature')` to group endpoints.
2. **Operations:** Use `@ApiOperation({ summary: '...' })` for clarity.
3. **Responses:** Document both success (`@ApiResponse`) and error (`@ApiBadRequestResponse`) scenarios.
4. **Properties:** Decorate DTO fields with `@ApiProperty({ example: '...' })`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
