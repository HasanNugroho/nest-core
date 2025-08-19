// Service Injection Tokens (Symbols)
export const USER_SERVICE = Symbol('USER_SERVICE');
export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

// Repository Injection Tokens (Symbols)
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Metadata Key for Public Routes
export const IS_PUBLIC_KEY = 'isPublic';

// Time Constants
export const ONE_HOUR_S = 60 * 60;
export const ONE_DAY_S = 24 * ONE_HOUR_S;
export const ONE_WEEK_S = 7 * ONE_DAY_S;

export const ONE_HOUR_MS = ONE_HOUR_S * 1000;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
export const ONE_WEEK_MS = 7 * ONE_DAY_MS;
