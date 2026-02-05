# 🔍 Troubleshooting & Diagnostics

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

A playbook for diagnosing and resolving common issues in NexusAPI production environments.

---

## 📋 Table of Contents

- [General Diagnosis](#-general-diagnosis)
- [Database Issues](#-database-issues)
- [Redis & Queue Issues](#-redis--queue-issues)
- [Common Error Logs](#-common-error-logs)

---

## 🩺 General Diagnosis

### 1. Check Health Endpoint
First, query the health endpoint. It is the pulse of the system.
```bash
curl http://localhost:3000/api/v1/health
```
If this times out or returns 503, the Node.js process might be blocked or crashing.

### 2. Check Process Manager
If using Docker:
```bash
docker logs nexus-api_1 --tail 100
docker stats
```
If using PM2:
```bash
pm2 logs nexus-api
pm2 monit
```

---

## 🗄 Database Issues

### 🔴 Connection Refused
**Symptom:** `PrismaClientInitializationError: Can't reach database server`
**Fix:**
1. Check if Postgres container is running.
2. Verify `DATABASE_URL` in `.env`.
3. Ensure network connectivity between API and DB containers.

### 🟡 Connection Pool Exhaustion
**Symptom:** `Timeout waiting for a new client from the pool`
**Fix:**
- Increase `connection_limit` in `DATABASE_URL`.
- Example: `postgresql://...?connection_limit=20&pool_timeout=10`
- Check for leaking transactions (queries that never close).

---

## 🐇 Redis & Queue Issues

### 🔴 Helper Thread Blocked
**Symptom:** `Error: ReplyError: ERR max number of clients reached`
**Fix:**
- Redis connection limit reached. Increase `maxclients` in `redis.conf`.
- Ensure `BullModule` and `CacheModule` are reusing connections properly.

### 🟡 Jobs Stuck in "Active"
**Symptom:** Background tasks are not finishing.
**Cause:**
- The worker process crashed mid-job.
- The `process()` function has an infinite loop or `await` hang.
**Fix:**
- Restart the worker container.
- BullMQ will automatically move stalled jobs back to "Wait" (depending on config).

---

## 📜 Common Error Logs

| Error | Meaning | Action |
|-------|---------|--------|
| `EADDRINUSE: address already in use` | Port 3000 is occupied. | Kill the other process or change `PORT`. |
| `P2002: Unique constraint failed` | Duplicate data (e.g. Email). | Handle in code or fix data seeding. |
| `P2025: Record to update not found` | ID in `update()` doesn't exist. | Validation issue. Check ID before updating. |

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
