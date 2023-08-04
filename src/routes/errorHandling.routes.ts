import { logger } from '../utils/logger';
import { RouteOpts } from '../utils/types';

const errorHandling = (error: RouteOpts['error'], res: RouteOpts['res']) => {
	logger.error(error);
	return res
		.status(error.status || 500)
		.json(error.message || { message: 'Some error happened' });
};

export { errorHandling };
