import { Router } from 'express';
import { authRoutes } from './routes/auth.routes';
import { notFound } from './routes/notFound.routes';
import { errorHandling } from './routes/errorHandling.routes';
import { RouteOpts } from './utils/types';

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