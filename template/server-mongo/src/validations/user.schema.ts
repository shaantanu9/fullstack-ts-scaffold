import { z } from 'zod';
import { ROLES } from '../constants/roles';

// This backend stores user IDs as MongoDB ObjectIds (24 hex chars), so the route
// param must match that shape. Rejecting other shapes here returns a clean 400,
// keeping the invalid-id contract identical to the SQL backend.
const isObjectId = (value: string): boolean => /^[0-9a-f]{24}$/i.test(value);

export const userIdSchema = z.object({
  id: z.string().refine(isObjectId, {
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
