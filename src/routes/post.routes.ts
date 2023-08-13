import { Router } from 'express';
import { postController } from '../controllers/Post.controller';
import { validateSchema } from '../middlewares/validateSchema';
import { createPostSchema } from '../schema/post.Schema';

const router = Router();

router.post('/', validateSchema(createPostSchema), postController.create);

export { router as postRoutes };
