import { logger } from '../utils/logger';
import { RouteOpts } from '../utils/types';

const formatError = (error: RouteOpts['error']) => {
	if (error.issues) {
		return error.issues.map((error) => ({
			message: error.message,
			expected: error.expected,
			received: error.received,
			path: error.path,
		}));
	}
	return [
		{
			message: error.message || 'Some error happened',
			path: error.path,
		},
	];
};

const errorHandling = (error: RouteOpts['error'], res: RouteOpts['res']) => {
	const statusCode = error.status || 500;
	const responseBody = {
		errors: formatError(error),
		path: error.path,
	};

	logger.error(responseBody);
	return res.status(statusCode).json(responseBody);
};

export { errorHandling };
