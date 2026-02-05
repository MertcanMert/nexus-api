# 🏗 Project Structure & Architecture

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

NexusAPI follows a **Modular Monolith** architecture, heavily influenced by **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

---

## 📋 Table of Contents

- [Philosophy](#-philosophy)
- [Directory Map](#-directory-map)
- [Module Types](#-module-types)
- [Dependency Flow](#-dependency-flow)

---

## 🧠 Philosophy

The primary goal is **Separation of Concerns**. We clearly distinguish between **Business Logic** (the "What") and **Infrastructure** (the "How").

- **Business Logic:** User management, Authentication rules, Permissions.
- **Infrastructure:** Sending emails, Uploading files, Database connections, Queues.

---

## 🗺 Directory Map

```
src/
├── common/                 # Shared utilities, decorators, guards, filters
│   ├── decorators/         # Custom decorators (@CurrentUser, @Roles)
│   ├── dto/                # Shared Data Transfer Objects
│   ├── filters/            # Global Exception Filters
│   ├── guards/             # Authentication & Authorization Guards
│   ├── interceptors/       # Response & Context Interceptors
│   └── i18n/               # Translation files
│
├── infrastructure/         # Technical implementations (The "How")
│   ├── audit/              # Audit Logging Logic
│   ├── background-tasks/   # BullMQ Consumers & Producers
│   ├── mail/               # SMTP / Email Service
│   ├── prisma/             # Database ORM Configuration
│   └── storage/            # AWS S3 / File Uploads
│
├── modules/                # Domain Business Logic (The "What")
│   ├── auth/               # Authentication & Policies
│   ├── health/             # System Health Checks
│   └── user/               # User Management & Admin
│
├── app.module.ts           # Root Module (Wiring everything together)
└── main.ts                 # Entry Point (Bootstrap, Global Pipes/Middleware)
```

---

## 🧩 Module Types

### 1. Domain Modules (`src/modules`)
These contain the core business rules. They should be relatively independent of the underlying technology.
- **Components:** `Controller`, `Service`, `Repository` (Optional), `DTOs`.

### 2. Infrastructure Modules (`src/infrastructure`)
These wrap external tools and libraries. If we decide to switch from Nodemailer to SendGrid, or from S3 to Google Cloud Storage, **only these folders should change**.
- **Components:** `Service`, `Processor` (Queue), `Client` wrappers.

### 3. Common Module (`src/common`)
Contains cross-cutting concerns that touch every part of the app.
- **Components:** `Guards`, `Interceptors`, `Filters`, `Decorators`.

---

## 🌊 Dependency Flow

The golden rule of Clean Architecture here is:

✅ **Allowed:** `Modules` -> `Infrastructure`
(e.g., `AuthService` uses `MailService` to send a welcome email)

✅ **Allowed:** `Modules` -> `Common`
(e.g., `UserController` uses `OwnershipGuard`)

❌ **Forbidden:** `Common` -> `Modules`
(Utility classes should not depend on business logic to avoid circular dependencies)

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
