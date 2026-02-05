# 🧪 Testing Strategy

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Supertest](https://img.shields.io/badge/Supertest-HTTP-green)](https://github.com/visionmedia/supertest)

NexusAPI enforces a rigorous testing culture with a **Test Pyramid** approach, focusing on Unit Tests and End-to-End (E2E) integration tests.

---

## 📋 Table of Contents

- [Unit Testing](#-unit-testing)
- [E2E Testing](#-e2e-testing)
- [Test Commands](#-test-commands)
- [Best Practices](#-best-practices)

---

## 🧩 Unit Testing

**Scope:** Individual methods, Services, Pipes, Guards, and Utilities.
**Location:** Co-located with source files (e.g., `user.service.ts` -> `user.service.spec.ts`).
**Mocking:** All external dependencies (Database, Queues, Config) **MUST** be mocked.

### Example (Service Test)
```typescript
it('should create a user', async () => {
  // 1. Arrange
  const dto = { email: 'test@test.com' };
  prismaMock.user.create.mockResolvedValue(mockUser);

  // 2. Act
  const result = await userService.create(dto);

  // 3. Assert
  expect(result).toEqual(mockUser);
  expect(prismaMock.user.create).toHaveBeenCalled();
});
```

---

## 🔌 E2E Testing

**Scope:** The entire application flow, from HTTP Request to Database (and back).
**Location:** `test/` folder in the root.
**Mocking:** Minimal mocking (e.g., only external APIs like Payment Gateways). **Database is REAL** (usually a test container or temp DB).

### Key Scenarios Covered:
- **Authentication:** Login/Refresh flows.
- **Tenancy:** Ensuring User A cannot see User B's data (`auth-tenancy.e2e-spec.ts`).
- **Validation:** Ensuring 400 Bad Request on invalid DTOs.

### Example (Supertest)
```typescript
it('/auth/login (POST)', () => {
  return request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: 'valid@user.com', password: 'password' })
    .expect(200)
    .expect(res => {
        expect(res.body.data.access_token).toBeDefined();
    });
});
```

---

## 🕹 Test Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run all Unit Tests |
| `npm run test:watch` | Run Unit Tests in watch mode (Logic development) |
| `npm run test:cov` | Generate Code Coverage Report |
| `npm run test:e2e` | Run End-to-End Tests (Slower, Verification) |

---

## 🏆 Best Practices

1. **Isolation:** Tests must not depend on each other.
2. **Clean State:** E2E tests should assume a clean DB or clean it up `beforeEach` / `afterAll`.
3. **Descriptive Names:** `it('should return 403 if user is not admin')` is better than `it('test admin')`.
4. **Coverage:** Aim for >80% coverage on Business Logic (Services).

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
