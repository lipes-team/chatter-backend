import { Router } from 'express';
import { commentController } from '../controllers/Comment.controller';
import { validateSchema } from '../middlewares/validateSchema';
import { createCommentSchema } from '../validation/comment.schema';
import { testIdSchema } from '../validation/id.schema';

const router = Router();

// This :id is actually the postId
router.post(
	'/:id',
	validateSchema(testIdSchema('Create Comment')),
	validateSchema(createCommentSchema),
	commentController.create
);
router.get('/:id', commentController.findOne);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

export { router as commentRoutes };
