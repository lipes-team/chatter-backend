import { RouteOpts } from '../utils/types';
import { AnyZodObject } from 'zod';

export const validateSchema =
	(schema: AnyZodObject) =>
	(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) => {
		// TODO: Add payload to destructuring
		const { body, params, query } = req;
		try {
			schema.parse({
				body,
				params,
				query,
				// payload TODO: uncomment after adding auth
			});
			next();
		} catch (error: any) {
			error.path = 'Validation';
			next(error);
		}
	};
