import { Router } from 'express';
import { commentController } from '../controllers/Comment.controller';

const router = Router();

router.post('/', commentController.create);
router.get('/:id', commentController.findOne);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

export { router as commentRoutes };
