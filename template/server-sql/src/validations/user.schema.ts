import { z } from 'zod';
import { ROLES } from '../constants/roles';

// This backend stores user IDs as Postgres UUIDs, so the route param must be a
// UUID. Rejecting other shapes here returns a clean 400 instead of letting a
// non-UUID reach Prisma's uuid column and surface as a 500.
const isUUID = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const userIdSchema = z.object({
  id: z.string().refine(isUUID, {
    message: 'Invalid user ID',
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum([ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]).optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'email', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
