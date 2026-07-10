// Mirrors the backend role vocabulary (server-*/src/constants/roles.ts) so the
// client and API agree on role identifiers. Roles are opaque display strings on
// the client; DEFAULT_ROLE is the fallback when a session carries no role yet.
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE: Role = ROLES.USER;
