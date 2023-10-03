import { Router } from 'express';
import { postController } from '../controllers/Post.controller';
import { validateSchema } from '../middlewares/validateSchema';
import { createPostSchema, updatePostSchema } from '../validation/post.schema';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { testIdSchema } from '../validation/id.schema';

const router = Router();

router.get(
	'/:id',
	validateSchema(testIdSchema('Get one')),
	postController.getOne
);
router.post('/', validateSchema(createPostSchema), postController.create);
router.put(
	'/:id',
	validateSchema(testIdSchema('Update')),
	validateSchema(updatePostSchema),
	postController.update
);
router.delete(
	'/:id',
	validateSchema(testIdSchema('Delete')),
	postController.delete
);

export { router as postRoutes };
