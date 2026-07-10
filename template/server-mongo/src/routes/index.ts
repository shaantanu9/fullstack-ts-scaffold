import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import { appConfig } from '../config/app.config';

const router = Router();

const apiPrefix = appConfig.apiPrefix;

router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/users`, userRoutes);
router.use(`${apiPrefix}/uploads`, uploadRoutes);

export default router;
