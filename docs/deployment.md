# 🚀 NexusAPI Deployment Guide

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

This document details how to deploy NexusAPI to production environments using **Docker** with comprehensive security, monitoring, and scaling considerations.

---

## 📋 Table of Contents

- [Docker Deployment (Recommended)](#-docker-deployment-recommended)
- [PM2 Deployment (Legacy)](#-pm2-deployment-legacy)
- [Environment Variables](#-environment-variables)
- [CI/CD Suggestions](#-cicd-suggestions)

---

## 🐳 Docker Deployment (Recommended)

Start by creating a `Dockerfile` in the root of your project optimized for production (Multi-stage build).

### 1. Production Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm run build
# Remove devDependencies
RUN npm prune --production

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
```

### 2. Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/nexus
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: nexus
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

### 3. Running

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## ⚡ PM2 Deployment (Legacy)

If you prefer running directly on a VPS (Ubuntu/Debian) without Docker.

### 1. Install Dependencies

```bash
sudo apt update
sudo apt install nodejs npm redis-server postgresql
sudo npm install -g pm2
```

### 2. Build Project

```bash
git clone <repo-url>
cd nexus-api
npm install
npx prisma generate
npm run build
```

### 3. Start with PM2

```bash
pm2 start dist/main.js --name nexus-api
pm2 save
pm2 startup
```

---

## 🌍 Environment Variables

Ensure your production `.env` contains:

```env
NODE_ENV=production
# Use internal docker names if using docker-compose
DATABASE_URL=postgresql://user:pass@db:5432/nexus
REDIS_HOST=redis
```

---

## 🔄 CI/CD Suggestions

### GitHub Actions Workflow

1. **Test:** Run `npm run test` on every PR.
2. **Build:** Run `docker build` on merge to main.
3. **Deploy:** Push image to Docker Hub / ECR and trigger a webhook on your server (Watchtower or SSH).

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
