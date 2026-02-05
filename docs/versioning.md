# 🔄 API Versioning Strategy

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

NexusAPI uses **URI Versioning** to manage changes without breaking existing clients.

---

## 📋 Table of Contents

- [Current Version](#-current-version)
- [Implementation](#-implementation)
- [Deprecation Policy](#-deprecation-policy)

---

## 📌 Current Version

**Active Version:** `v1`
**Base URL:** `/api/v1`

---

## 🛠 Implementation

We use the built-in NestJS versioning system.

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
});
```

### Controller Usage

```typescript
@Controller({
  path: 'users',
  version: '1', // Routes become /api/v1/users
})
export class UserControllerV1 {}

@Controller({
  path: 'users',
  version: '2', // Routes become /api/v2/users
})
export class UserControllerV2 {}
```

---

## ⚠️ Deprecation Policy

When introducing breaking changes (e.g., renaming a field, changing response structure):

1. **Create V2:** implement the new logic in a new controller/method.
2. **Mark V1 Deprecated:** Add `@Deprecated` JSDoc and Swagger annotation to V1.
3. **Sunset:** Maintain V1 for X months (e.g., 6 months) before removal.

**Non-Breaking Changes:**
- Adding a new optional field.
- Adding a new endpoint.
These can go directly into `v1`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
