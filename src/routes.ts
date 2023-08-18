import { Router } from 'express';
import { authRoutes } from './routes/auth.routes';
import { notFound } from './routes/notFound.routes';
import { errorHandling } from './routes/errorHandling.routes';
import { RouteOpts } from './utils/types';
import { postRoutes } from './routes/post.routes';
import { userRoutes } from './routes/user.routes';

const router = Router();

router.get('/', (req, res, next) => {
	try {
		throw new Error('test handler');
	} catch (error: any) {
		error.place = 'Test';
		error.status = 400;
		next(error);
	}
});

router.use('/auth', authRoutes);

router.use('/post', postRoutes);

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
