# NexusAPI Architecture Decisions

## ADR-001: Multi-Tenancy Strategy

**Status**: Accepted  
**Date**: 2026-02-05  
**Decision**: Single-database shared-schema multi-tenancy with tenant isolation at application layer.

### Context

Need to support multiple tenants while maintaining data isolation and scalability.

### Decision

- Use `tenantId` field in all relevant tables
- Implement tenant filtering via Prisma extensions
- Use CLS (Continuation-Local Storage) for request-scoped tenant context
- Automatic tenant filtering in all database queries

### Consequences

- Positive: Cost-effective, easier maintenance
- Positive: Automatic data isolation prevents leaks
- Negative: Requires careful query optimization at scale
- Negative: Single point of failure for all tenants

---

## ADR-002: Authentication Strategy

**Status**: Accepted  
**Date**: 2026-02-05  
**Decision**: Dual-token JWT authentication with HttpOnly cookies.

### Context

Need secure authentication that supports both web and mobile clients with good security properties.

### Decision

- Access token (short-lived, 15 minutes) in Authorization header
- Refresh token (long-lived, 7 days) in HttpOnly cookie
- Token rotation on refresh
- Bcrypt with 12 rounds for password hashing

### Consequences

- Positive: Protection against XSS attacks
- Positive: Automatic token rotation improves security
- Negative: More complex token management
- Negative: Requires careful cookie configuration

---

## ADR-003: Authorization Model

**Status**: Accepted  
**Date**: 2026-02-05  
**Decision**: Role-Based Access Control (RBAC) with Attribute-Based Access Control (ABAC) capabilities using CASL.

### Context

Need flexible authorization that can handle both simple roles and complex permissions.

### Decision

- Base roles: USER, ADMIN
- Fine-grained permissions using CASL
- Resource ownership checks
- Tenant-scoped permissions

### Consequences

- Positive: Flexible and extensible
- Positive: Clear permission boundaries
- Negative: Increased complexity in permission logic
- Negative: Requires thorough testing

---

## ADR-004: Caching Strategy

**Status**: Accepted  
**Date**: 2026-02-05  
**Decision**: Redis-based multi-layer caching with tenant isolation.

### Context

Need to improve performance while maintaining data consistency and tenant isolation.

### Decision

- L1: Application-level cache (Redis)
- L2: Database query cache
- Tenant-specific cache keys
- Cache invalidation on data changes

### Consequences

- Positive: Improved response times
- Positive: Reduced database load
- Negative: Cache invalidation complexity
- Negative: Memory usage considerations

---

## ADR-005: Background Processing

**Status**: Accepted  
**Date**: 2026-02-05  
**Decision**: BullMQ with Redis for reliable background job processing.

### Context

Need to handle async tasks like email sending, audit logging, and file processing.

### Decision

- BullMQ for job queue management
- Redis as job backend
- Separate processors for different job types
- Job retry and failure handling

### Consequences

- Positive: Reliable job processing
- Positive: Better user experience (non-blocking)
- Negative: Additional infrastructure dependency
- Negative: Job monitoring complexity
