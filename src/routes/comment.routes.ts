import { Router } from 'express';
import { commentController } from '../controllers/Comment.controller';
import { validateSchema } from '../middlewares/validateSchema';
import {
	createCommentSchema,
	updateCommentSchema,
} from '../validation/comment.schema';
import { testIdSchema } from '../validation/id.schema';

const router = Router();

// This :id is actually the postId
router.post(
	'/:id',
	validateSchema(testIdSchema('Create Comment')),
	validateSchema(createCommentSchema),
	commentController.create
);
router.get(
	'/:id',
	validateSchema(testIdSchema('Find Comment')),
	commentController.findOne
);
router.put(
	'/:id',
	validateSchema(testIdSchema('Update Comment')),
	validateSchema(updateCommentSchema),
	commentController.update
);
router.delete(
	'/:id',
	validateSchema(testIdSchema('Delete Comment')),
	commentController.delete
);

export { router as commentRoutes };
