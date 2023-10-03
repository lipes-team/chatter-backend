import { Router } from 'express';
import { notFound } from './routes/notFound.routes';
import { errorHandling } from './routes/errorHandling.routes';
import { RouteOpts } from './utils/types';
import { postRoutes } from './routes/post.routes';
import { userRoutes } from './routes/user.routes';
import { commentRoutes } from './routes/comment.routes';
import { isAuthenticated } from './middlewares/isAuthenticated';

const router = Router();

/* router.use('/auth', authRoutes); running the auth through /user instead */

router.use('/posts', isAuthenticated, postRoutes);

router.use('/comments', isAuthenticated, commentRoutes);

router.use('/user', userRoutes);

router.use(
	(
		error: RouteOpts['error'],
		req: RouteOpts['req'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) => errorHandling(error, res)
);

router.use(notFound);

export { router as allRoutes };
