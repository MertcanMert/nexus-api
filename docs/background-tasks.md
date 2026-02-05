# 🕒 Background Tasks

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis-DC382D)](https://docs.bullmq.io/)

NexusAPI leverages **BullMQ** (powered by Redis) for robust, asynchronous background processing.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Configuration](#-configuration)
- [Queues & Topics](#-queues--topics)
- [Implementation](#-implementation)
- [Usage (Producer)](#-usage-producer)

---

## 🏗 Overview

Tasks that are long-running or non-blocking (e.g., sending emails, audit logs) are offloaded to background queues.

**Benefits:**
- **Performance:** User gets an instant response.
- **Reliability:** Failed jobs are automatically retried.
- **Scalability:** Workers can be scaled independently of the API.

---

## ⚙️ Configuration

**Redis** connection is configured in `app.module.ts` by `BullModule.forRootAsync`.

**Environment:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...
REDIS_DB=1 # Recommended to use a separate DB for Queues
```

---

## 🏎 Queues & Topics

**Queue Name:** `mail-queue` (Currently shared for both Mail and Audit Logs for simplicity)

**Job Topics:**
- `send-email`: Handled by `MailProcessor`.
- `audit-log`: Handled by `AuditLogProcessor`.

---

## 🧩 Implementation

### 1. Consumer (Processor)
**File:** `src/infrastructure/background-tasks/mail.processor.ts`

```typescript
@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === 'send-email') {
      // Logic
    }
  }
}
```

### 2. Producer (Service)
**File:** `src/infrastructure/background-tasks/background-tasks.service.ts`

Uses `BackgroundTasksService` as a facade to abstract the queue implementation details.

```typescript
async addEmailTask(email: string, subject: string, body: string) {
  await this.mailQueue.add('send-email', { email, subject, body });
}
```

---

## 💻 Usage (Producer)

Simply inject the `BackgroundTasksService`.

```typescript
constructor(private readonly tasksService: BackgroundTasksService) {}

async registerUser() {
  // ... create user logic ...

  // Fire and forget
  await this.tasksService.addEmailTask(user.email, 'Welcome', '<h1>Hi!</h1>');
}
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
