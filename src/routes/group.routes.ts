import { Router } from 'express';
import { validateSchema } from '../middlewares/validateSchema';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { groupController } from '../controllers/Group.controller';

const router = Router();

//TODO: Add Zod Validation
router.post(
    '/create',
    /* validateSchema(createGroupSchema), */
    isAuthenticated,
    groupController.create
);

router.get("/:id", isAuthenticated, groupController.getById)

export { router as groupRoutes };