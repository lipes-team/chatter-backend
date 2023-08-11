import { Router } from 'express';
import { postController } from '../controllers/Post.controller';

const router = Router();

router.post('/', postController.create);

export { router as postRoutes };
