import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { I18nContext } from 'nestjs-i18n';

jest.mock('bcrypt');
jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let userRepository: UserRepository;
  let configService: ConfigService;

  const mockUserService = {
    getUserByEmail: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'secret';
      if (key === 'JWT_EXPIRES_IN_ACCESS_TOKEN') return '15m';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      if (key === 'JWT_EXPIRES_IN_REFRESH_TOKEN') return '7d';
      return null;
    }),
  };

  const mockI18n = {
    t: jest.fn((key) => key),
  };

  beforeEach(async () => {
    (I18nContext.current as jest.Mock).mockReturnValue(mockI18n);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if password does not match', async () => {
      mockUserService.getUserByEmail.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user data if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const payload = {
        sub: '1',
        id: '1',
        email: 'test@example.com',
        role: Role.USER,
        tenantId: 'tenant-1',
      };
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(payload);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockUserService.updateRefreshToken).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(service.refresh('1', 'refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should successfully refresh tokens', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: Role.USER,
        tenantId: 'tenant-1',
        refreshToken: 'hashedRefreshToken',
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('new-token');

      const result = await service.refresh('1', 'refresh-token');
      expect(result).toHaveProperty('access_token');
    });
  });
});
