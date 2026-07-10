import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// GET /uploads/imagekit-auth — mint signed ImageKit upload params.
router.get('/imagekit-auth', uploadController.getImageKitAuth);

export default router;
