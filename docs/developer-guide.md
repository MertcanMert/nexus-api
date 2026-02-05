# 💻 Developer Guide

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Contributing](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Welcome to the NexusAPI development team! This guide will help you set up your environment and understand our development workflows.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Setup & Installation](#-setup--installation)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Git Workflow](#-git-workflow)

---

## 🛠 Prerequisites

Ensure you have the following installed:

- **Node.js** v18+ (`node -v`)
- **npm** v9+ (`npm -v`)
- **Docker** & Docker Compose (for DB/Redis)

---

## 🚀 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/nexus-api.git
   cd nexus-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Update .env with your local credentials
   ```

4. **Start Infrastructure (DB + Redis)**
   ```bash
   docker-compose up -d
   ```

5. **Run Migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start Application**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`.
Swagger Docs: `http://localhost:3000/docs`.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Starts the app in watch mode (Hot-Reload) |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm run format` | Fixes formatting issues (Prettier) |
| `npm run lint` | Fixes linting errors (ESLint) |
| `npm run test` | Runs Unit Tests |
| `npm run test:e2e` | Runs End-to-End Tests |
| `npx prisma studio` | Opens database GUI |

---

## 🏗 Project Structure

See [Project Architecture](./project-structure.md) for a detailed map.

**Quick Rule:**
- **Business Logic** goes into `src/modules`.
- **Infrastructure** (e.g., S3, SMTP) goes into `src/infrastructure`.
- **Utilities** go into `src/common`.

---

## 🌿 Git Workflow

We follow the **Feature Branch** workflow and **Conventional Commits**.

### Branch Naming
- `feature/user-profile`
- `fix/login-bug`
- `docs/update-readme`

### Commit Messages
Format: `<type>(<scope>): <subject>`

- `feat(auth): add google oauth`
- `fix(user): resolve crash on update`
- `docs(readme): update install guide`
- `chore(deps): upgrade nestjs`
- `test(audit): add unit tests`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
