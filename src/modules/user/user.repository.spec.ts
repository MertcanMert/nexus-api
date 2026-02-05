import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tenant: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWithTenant', () => {
    it('should execute a transaction to create tenant and user', async () => {
      const data = {
        email: 'test@example.com',
        password: 'hash',
        tenantName: 'Org',
      };
      const mockTenant = { id: 'tenant-1', name: 'Org' };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
      };

      // Mock $transaction behavior
      mockPrismaService.$transaction.mockImplementation((cb) => {
        const tx = {
          tenant: { create: jest.fn().mockResolvedValue(mockTenant) },
          user: { create: jest.fn().mockResolvedValue(mockUser) },
        };
        return cb(tx);
      });

      const result = await repository.createWithTenant(data);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email and not deleted', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
      });
      const result = await repository.findByEmail('a@b.com');
      expect(result).toBeDefined();
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'a@b.com', deletedAt: null },
        }),
      );
    });
  });

  describe('softDelete', () => {
    it('should update deletedAt field', async () => {
      await repository.softDelete('1');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: { deletedAt: expect.any(Date) },
        }),
      );
    });
  });
});
