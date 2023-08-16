import mongoose from 'mongoose';
import z from 'zod';

export const createPostSchema = z.object({
	body: z.object({
		title: z.string().nonempty(),
		// TODO: This will change after the post base being added
		postInfo: z.string().array().optional(),
	}),
});
// TODO: This will be a validation for the objectId
//.refine(data => mongoose.isValidObjectId(data.postInfo))
