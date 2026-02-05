import { Role } from '@prisma/client';

/**
 * Authenticated User Interface
 * Represents the user object returned by JWT strategies after token validation
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  tenantId: string;
  refreshToken?: string; // Only present in refresh token strategy
}
