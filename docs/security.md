# 🛡 Security Architecture

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Helmet](https://img.shields.io/badge/Helmet-Security-green)](https://helmetjs.github.io/)

NexusAPI enforces a **Defense in Depth** strategy, layering multiple security measures.

---

## 📋 Table of Contents

- [Rate Limiting (Throttler)](#-rate-limiting-throttler)
- [HTTP Headers (Helmet)](#-http-headers-helmet)
- [CORS Policy](#-cors-policy)
- [Data Sanitization](#-data-sanitization)

---

## 🚦 Rate Limiting (Throttler)

**Verified Config:** `src/app.module.ts`

To prevent abuse and DDoS attacks, the `@nestjs/throttler` module is active globally.

**Default Limits:**
- **Requests:** 100 requests (MAX)
- **Window:** 60 seconds (TTL)

**Customization:**
You can override this on specific controllers:
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
@Controller('sensitive-route')
```

---

## 🛡 HTTP Headers (Helmet)

**Verified Config:** `src/main.ts`

`helmet()` is applied globally. It sets essential security headers by default:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` (Clickjacking protection)
- `Content-Security-Policy` (CSP) default directives.

---

## 🌐 CORS Policy

**Verified Config:** `src/main.ts`

Cross-Origin Resource Sharing (CORS) is enabled.

**Development:**
- `origin: true` (Dynamically reflects request origin)
- `methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS`
- `credentials: true` (Allows Cookies)

**Production Recommendation:**
Replace `origin: true` with an explicit array of allowed domains (e.g., `['https://app.nexus.com']`).

---

## 🧼 Data Sanitization

**Verified Config:** `ValidationPipe` in `main.ts`

1.  **Whitelist (`whitelist: true`):** Automatically strips any properties from the request body that are not defined in the DTO.
2.  **Forbid Unknown (`forbidNonWhitelisted: true`):** Throws `400 Bad Request` if unknown properties are present. This prevents "Mass Assignment" vulnerabilities.
3.  **Transformation (`transform: true`):** Automatically converts primitives (e.g., string -> number) based on DTO types.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
