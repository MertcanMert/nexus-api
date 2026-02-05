import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/prisma/prisma.service';

describe('Auth & Multi-Tenancy (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    await (prisma as any).user.deleteMany({
      where: { email: { contains: 'test-e2e' } },
    });
    await (prisma as any).tenant.deleteMany({
      where: { name: { contains: 'test-e2e' } },
    });
    await app.close();
  });

  it('should isolate data between tenants', async () => {
    const emailA = 'userA@test-e2e.com';
    const emailB = 'userB@test-e2e.com';

    // 1. Register Tenant A
    const regARes = await request(app.getHttpServer())
      .post('/api/v1/user')
      .send({ email: emailA, password: 'Password123!' });

    if (regARes.status !== 201) {
      console.error(
        'Register A failed:',
        JSON.stringify(regARes.body, null, 2),
      );
    }
    expect(regARes.status).toBe(201);

    const tenantAId = regARes.body.data.tenantId;

    // 2. Register Tenant B
    const regBRes = await request(app.getHttpServer())
      .post('/api/v1/user')
      .send({ email: emailB, password: 'Password123!' });

    expect(regBRes.status).toBe(201);

    const tenantBId = regBRes.body.data.tenantId;

    // 2.5 Promote User A to ADMIN to allow fetching users
    await (prisma as any).user.update({
      where: { email: emailA },
      data: { role: 'ADMIN' },
    });

    // 3. Login Tenant A
    const loginARes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: emailA, password: 'Password123!' });

    if (loginARes.status !== 200) {
      console.error('Login A failed:', JSON.stringify(loginARes.body, null, 2));
    }
    expect(loginARes.status).toBe(200);

    const tokenA = loginARes.body.data.access_token;

    // 4. Try to fetch users as Tenant A
    // Since Prisma Extension automatically filters by Tenant A's ID (from JWT),
    // Tenant A should ONLY see Tenant A's users.
    const usersRes = await request(app.getHttpServer())
      .get('/api/v1/user-admin')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const users = usersRes.body.data.items;

    // Check isolation
    expect(users.every((u) => u.tenantId === tenantAId)).toBe(true);
    expect(users.some((u) => u.email === emailB)).toBe(false);
    expect(users.some((u) => u.email === emailA)).toBe(true);
  });
});
