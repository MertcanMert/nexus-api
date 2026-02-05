# ❌ Error Reference Guide

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

This document lists standard error codes and messages returned by NexusAPI. Use this as a reference for frontend handling.

---

## 📋 Table of Contents

- [Standard Response Format](#-standard-response-format)
- [HTTP Status Codes](#-http-status-codes)
- [Common Error Messages (i18n Keys)](#-common-error-messages-i18n-keys)

---

## 📨 Standard Response Format

All errors follow this JSON structure:

```json
{
  "success": false,
  "statusCode": 401,
  "meta": {
    "path": "/api/v1/resource",
    "method": "GET",
    "message": "Error description or i18n key",
    "timestamp": "ISO Date"
  }
}
```

---

## 🔢 HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| **400** | Bad Request | Validation failed (DTO mismatch) or Invalid Input |
| **401** | Unauthorized | Invalid Token, Expired Token, or Missing Credentials |
| **403** | Forbidden | Valid Token but insufficient permissions (Role/Policy) |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Duplicate resource (e.g., Email already registered) |
| **413** | Payload Too Large | File upload exceeds limit |
| **429** | Too Many Requests | Rate limit exceeded (Throttler) |
| **500** | Internal Error | Unhandled server exception |

---

## 🔑 Common Error Messages (i18n Keys)

The API attempts to return localized error keys. Only if `i18n` fails, it returns English text.

### Authentication (`auth.*`)

| Key | Description |
|-----|-------------|
| `auth.INVALID_CREDENTIALS` | Check email/password combination. |
| `auth.TOKEN_EXPIRED` | Access token time-to-live ended. Use Refresh Token. |
| `auth.TOKEN_MISSING` | Authorization header is empty. |

### User Management (`user.*`)

| Key | Description |
|-----|-------------|
| `user.NOT_FOUND` | User ID is invalid. |
| `user.EMAIL_EXISTS` | Registration failed; duplicate email. |
| `user.PASSWORD_WEAK` | Password does not meet complexity rules. |

### Validation (`validation.*`)

| Key | Description |
|-----|-------------|
| `validation.IS_EMAIL` | Field must be an email. |
| `validation.MIN_LENGTH` | String is too short. |
| `validation.IS_NotEmpty` | Required field is missing. |

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
