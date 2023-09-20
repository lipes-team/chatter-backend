import { Router } from 'express';
import { validateSchema } from '../middlewares/validateSchema';

import { createUserSchema, loginUserSchema } from '../validation/user.schema';
import { userController } from '../controllers/User.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = Router();

router.post('/signup', validateSchema(createUserSchema), userController.create);

router.post('/login', validateSchema(loginUserSchema), userController.login);

router.post("/update", isAuthenticated, userController.update)

export { router as userRoutes };
