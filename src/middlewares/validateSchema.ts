import { RouteOpts } from '../utils/types';
import { AnyZodObject } from 'zod';

export const validateSchema =
	(schema: AnyZodObject) =>
	(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) => {
		const { body, params, query } = req;
		try {
			schema.parse({
				body,
				params,
				query,
			});
			next();
		} catch (error: any) {
			error.path = 'Validation';
			error.status = 400;
			next(error);
		}
	};
