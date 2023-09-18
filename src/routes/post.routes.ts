import { Router } from 'express';
import { postController } from '../controllers/Post.controller';
import { validateSchema } from '../middlewares/validateSchema';
import { createPostSchema } from '../validation/post.schema';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = Router();

router.use(isAuthenticated);
router.post('/', validateSchema(createPostSchema), postController.create);

export { router as postRoutes };
