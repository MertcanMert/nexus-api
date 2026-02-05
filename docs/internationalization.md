# 🌍 Internationalization (i18n)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![nestjs-i18n](https://img.shields.io/badge/nestjs--i18n-Global-blue)](https://nestjs-i18n.com/)

NexusAPI supports dynamic language switching for API responses, error messages, and validation texts using `nestjs-i18n`.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [How to Use](#-how-to-use)
- [Structure](#-structure)
- [Translation Files](#-translation-files)
- [Best Practices](#-best-practices)

---

## 🏗 Overview

The system detects the client's preferred language by the `Accept-Language` header and automatically formats the response messages.

**Default Language:** `en` (English)
**Supported Languages:** `en`, `tr` (Turkish)

---

## 💻 How to Use

### Client Request (Verified)
The API respects the `Accept-Language` header.

**English (Default):**
```bash
curl -H "Accept-Language: en" http://localhost:3000/api/v1/auth/me
# Response: "Unauthorized"
```

**Turkish:**
```bash
curl -H "Accept-Language: tr" http://localhost:3000/api/v1/auth/me
# Response: "Yetkisiz Erişim"
```

**Query Parameter (Optional):**
If configured, you can also use `?lang=tr`.
```bash
curl http://localhost:3000/api/v1/auth/me?lang=tr
```

### Backend Usage

**In Filters (Global Exceptions):**
```typescript
const i18n = I18nContext.current();
const message = i18n.t('errors.UNAUTHORIZED');
```

**In Services:**
```typescript
constructor(private readonly i18n: I18nService) {}

hello() {
  return this.i18n.t('common.HELLO', { lang: 'tr' });
}
```

---

## 📂 Structure

Translation files are stored in `src/i18n/`.

```
src/i18n
├── en
│   ├── common.json  # General messages
│   └── errors.json  # Error descriptions
└── tr
    ├── common.json
    └── errors.json
```

---

## 📝 Translation Files example

`src/i18n/en/errors.json`:
```json
{
  "UNAUTHORIZED": "You are not authorized to access this resource.",
  "USER_NOT_FOUND": "User with ID {id} was not found."
}
```

`src/i18n/tr/errors.json`:
```json
{
  "UNAUTHORIZED": "Bu kaynağa erişim yetkiniz yok.",
  "USER_NOT_FOUND": "{id} kimliğine sahip kullanıcı bulunamadı."
}
```

---

## 🏆 Best Practices

1. **Keys, not Strings:** Never hardcode strings in code. Always use keys like `auth.LOGIN_SUCCESS`.
2. **Fallback:** The system falls back to `en` if the requested language is missing.
3. **Type Safety:** Use `I18nPath` types to prevent typos in translation keys.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
