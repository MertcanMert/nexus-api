# 📧 Mail System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-blue)](https://nodemailer.com/)

The Mail System handles transactional emails using SMTP. It supports both direct sending and asynchronous background processing.

---

## 📋 Table of Contents

- [Configuration](#-configuration)
- [Usage (Direct)](#-usage-direct)
- [Usage (Queue)](#-usage-queue)
- [Templates](#-templates)

---

## ⚙️ Configuration

**Environment Variables:**
The system uses `ConfigService` to strictly validate these variables.

```env
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASS=secret-key
MAIL_FROM="NexusAPI <no-reply@nexusapi.com>"
```

---

## 📨 Usage (Direct)

**Service:** `src/infrastructure/mail/mail.service.ts`

Use `MailService` directly when you need to wait for the email to be sent (e.g., critical alerts).

```typescript
// Validated Method Signature
async sendEmail(to: string, subject: string, html: string): Promise<void>
```

**Example:**
```typescript
constructor(private readonly mailService: MailService) {}

async sendWelcome(email: string) {
  await this.mailService.sendEmail(
    email,
    'Welcome!',
    '<h1>Hello World</h1>' // Currently using raw HTML strings
  );
}
```

---

## 🐇 Usage (Queue)

**Recommended** for all non-critical emails to avoid blocking the API response.

**Processor:** `src/infrastructure/background-tasks/mail.processor.ts`
**Queue Name:** `mail-queue`
**Job Name:** `send-email`

**Example (Producer):**
```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

constructor(@InjectQueue('mail-queue') private mailQueue: Queue) {}

async sendAsync() {
  await this.mailQueue.add('send-email', {
    email: 'user@example.com',
    subject: 'Welcome',
    body: '<b>Async Hello</b>'
  });
}
```

---

## 🎨 Templates

Current implementation accepts raw HTML strings.
*Recommendation:* For complex emails, integrate `hbs` (Handlebars) or `ejs` in the future versions.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
