# 📝 Logging System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Winston](https://img.shields.io/badge/Winston-Logging-green)](https://github.com/winstonjs/winston)

NexusAPI employs a dual-layer logging strategy: **Application Logging** (for developers/debugging) and **Audit Logging** (for security/compliance).

---

## 📋 Table of Contents

- [Application Logs (Winston)](#-application-logs-winston)
- [Audit Logs (Security)](#-audit-logs-security)

---

## 🐞 Application Logs (Winston)

We replace the default NestJS logger with **Winston** for structured logging.

### Configuration (`winston.config.ts`)
- **Console Transport:** Beautifully formatted logs for local development using `nest-winston`.
- **File Transport:** Can be configured to write logs to disk in production (e.g., `error.log`, `combined.log`).
- **Levels:** `error`, `warn`, `info`, `debug`, `verbose`.

### Usage

```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
    this.logger.error('Something went wrong!', trace);
    this.logger.debug('Variable value:', someVar);
  }
}
```

---

## 🛡 Audit Logs (Security)

Unlike application logs which track *code execution*, Audit Logs track **user behavior** and **data mutations**.

They are stored in the database (`AuditLog` table) and are immutable records of critical actions.

For detailed documentation on the Audit System, see:
👉 [**Audit Logs Documentation**](./audit-logs.md)

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
