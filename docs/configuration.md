# ⚙️ Configuration & Environment

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Joi](https://img.shields.io/badge/Joi-Validation-blue)](https://joi.dev/)

Robust configuration management using `@nestjs/config` with strict schema validation by `Joi`.

---

## 📋 Table of Contents

- [Environment Variables](#-environment-variables)
- [Validation Schema](#-validation-schema)
- [Usage](#-usage)

---

## 🌍 Environment Variables

The application requires a `.env` file in the root directory.

### Core Variables

| Variable | Description | Required | Reference |
|----------|-------------|----------|-----------|
| `PORT` | API Port (e.g., 3000) | No (Def: 3000) | |
| `NODE_ENV` | `development` / `production` | Yes | |
| `DATABASE_URL` | PostgreSQL Connection String | Yes | [Multi-Tenancy](./multi-tenancy.md) |
| `REDIS_HOST` | Redis Host | Yes | [Caching](./caching.md) |

### Auth Secrets

| Variable | Description | Reference |
|----------|-------------|-----------|
| `JWT_SECRET` | Access Token Key | [Auth](./auth.md) |
| `JWT_REFRESH_SECRET` | Refresh Token Key | [Auth](./auth.md) |

### Cloud & Mail

| Variable | Description | Reference |
|----------|-------------|-----------|
| `AWS_S3_KEY` | AWS Credentials | [Storage](./storage.md) |
| `MAIL_HOST` | SMTP Server | [Mail](./mail-system.md) |

---

## 🛡 Validation Schema

We treat configuration errors as **critical**. If a required environment variable is missing or invalid, the application **will refuse to start**.

Defined in: `src/common/config/env.validation.ts`

```typescript
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  // ...other validations
});
```

---

## 💻 Usage

Inject `ConfigService` to access variables safely.

```typescript
constructor(private configService: ConfigService) {}

someMethod() {
  const dbUrl = this.configService.getOrThrow<string>('DATABASE_URL');
  // 'getOrThrow' ensures the value exists, or crashes loud and early.
}
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
