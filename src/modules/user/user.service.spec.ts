import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RegisterDTO } from 'src/common/dto/user/register.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { I18nContext } from 'nestjs-i18n';

jest.mock('bcrypt');
jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUserRepo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIdIncludeDeleted: jest.fn(),
    createWithTenant: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    hardDelete: jest.fn(),
    restore: jest.fn(),
    findAll: jest.fn(),
    countAll: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockI18n = {
    t: jest.fn((key) => key),
  };

  beforeEach(async () => {
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDTO = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockUserRepo.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully register a user', async () => {
      const registerDto: RegisterDTO = {
        email: 'new@example.com',
        password: 'password123',
      };
      mockUserRepo.findByEmail.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const mockResult = {
        id: '1',
        email: 'new@example.com',
        role: Role.USER,
        tenantId: 'tenant-1',
      };
      mockUserRepo.createWithTenant.mockResolvedValue(mockResult);

      const result = await service.register(registerDto);

      expect(result.email).toBe('new@example.com');
      expect(mockUserRepo.createWithTenant).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'hashedPassword',
        tenantName: "new's Organization",
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(service.getUserByEmail('none@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user if found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      const result = await service.getUserByEmail('test@example.com');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if no data provided', async () => {
      await expect(service.update('1', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update user successfully', async () => {
      const updateDto = { profile: { name: 'John' } };
      mockUserRepo.update.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      await service.update('1', updateDto as any);

      expect(mockUserRepo.update).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);
      await expect(service.softDelete('1')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete user', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: '1' });
      mockUserRepo.softDelete.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await service.softDelete('1');
      expect(mockUserRepo.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
