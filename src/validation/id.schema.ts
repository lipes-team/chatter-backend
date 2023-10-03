import mongoose from 'mongoose';
import { z } from 'zod';

export const testIdSchema = (place: string) => {
	return z.object({
		params: z.object({
			id: z.string().refine((data) => mongoose.isValidObjectId(data), {
				message: 'Invalid Id',
				path: [place],
			}),
		}),
	});
};
