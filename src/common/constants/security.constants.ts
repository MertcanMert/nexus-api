export const BCRYPT_SALT_ROUNDS = 12;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

export const AUTH_RATE_LIMITS = {
  login: { ttl: 60000, limit: 5 }, // 5 attempts per minute
  register: { ttl: 300000, limit: 3 }, // 3 attempts per 5 minutes
  refresh: { ttl: 60000, limit: 10 }, // 10 refresh attempts per minute
  general: { ttl: 60000, limit: 100 }, // 100 requests per minute
};
