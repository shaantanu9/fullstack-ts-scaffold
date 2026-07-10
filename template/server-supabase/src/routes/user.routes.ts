import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import { userIdSchema, updateUserSchema, userQuerySchema } from '../validations/user.schema';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authMiddleware);

router.get('/', validateRequest({ query: userQuerySchema }), userController.getUsers);
router.get('/:id', validateRequest({ params: userIdSchema }), userController.getUserById);
router.patch(
  '/:id',
  requireRole(ROLES.ADMIN, ROLES.MODERATOR),
  validateRequest({ params: userIdSchema, body: updateUserSchema }),
  userController.updateUser,
);
router.delete(
  '/:id',
  requireRole(ROLES.ADMIN),
  validateRequest({ params: userIdSchema }),
  userController.deleteUser,
);

export default router;
