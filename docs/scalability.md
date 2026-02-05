# 📈 Scalability Guide

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

NexusAPI is designed to scale horizontally. This document outlines the path from a single instance to a high-availability cluster.

---

## 📋 Table of Contents

- [Phase 1: Vertical Scaling](#-phase-1-vertical-scaling)
- [Phase 2: Horizontal Scaling (Stateless API)](#-phase-2-horizontal-scaling-stateless-api)
- [Phase 3: Database Scaling](#-phase-3-database-scaling)

---

## 🔼 Phase 1: Vertical Scaling

Also known as "Buying a bigger server".
- **Action:** Increase RAM and CPU for the container.
- **Node.js Limit:** Node.js is single-threaded. Increasing CPU cores won't help a single process much.
- **Solution:** Use **PM2 Cluster Mode** to utilize all cores on a single machine.
  ```bash
  pm2 start dist/main.js -i max
  ```

---

## ↔️ Phase 2: Horizontal Scaling (Stateless API)

Since we use **JWT** (Stateless Auth) and **Redis** (External Cache), the API layer is completely stateless. You can run 1 or 100 API instances behind a Load Balancer.

### Architecture
```
        [ Load Balancer (Nginx / ALB) ]
              /        |        \
       [ API 1 ]    [ API 2 ]    [ API 3 ]
              \        |        /
           [ Redis (Shared Cache) ]
           [ Database (Postgres) ]
```

### Requirements
1. **Shared Redis:** All instances MUST connect to the same Redis for Queues and Cache.
2. **No Local File Storage:** Do not use `fs.writeFileSync`. Use `StorageModule` (S3) for uploads.

---

## 🗄 Phase 3: Database Scaling

The database is usually the bottleneck.

### 1. Connection Pooling
Use **PgBouncer** in front of Postgres to manage thousands of concurrent connections from your API instances.

### 2. Read Replicas
Separate Read and Write operations.
- **Master DB:** Handle `INSERT`, `UPDATE`, `DELETE`.
- **Read Replica:** Handle `SELECT` (Reporting, Dashboards).
*Note: Requires configuring TypeORM/Prisma to use read/write replicas.*

### 3. Sharding (Tenancy)
Since we implement Multi-Tenancy, we can physically separate tenants into different databases in the future (e.g., Tenant A->DB1, Tenant B->DB2).

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
