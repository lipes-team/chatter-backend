import { RouteOpts } from '../utils/types';

const notFound = (_: RouteOpts['req'], res: RouteOpts['res']) => {
	return res.status(404).json('Requested resource not found');
};

export { notFound };
