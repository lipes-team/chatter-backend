import { logger } from '../utils/logger';
import { RouteOpts } from '../utils/types';

const errorHandling = (error: RouteOpts['error'], res: RouteOpts['res']) => {
	if (error.issues) {
		logger.error(error.issues);
		const errors = error.issues.map((error) => ({
			message: error.message,
			expected: error.expected,
			received: error.received,
			path: error.path,
		}));
		return res.status(error.status || 500).json({ errors, path: error.path });
	}

	logger.error(error);
	return res
		.status(error.status || 500)
		.json(error.message || { message: 'Some error happened' });
};

export { errorHandling };
