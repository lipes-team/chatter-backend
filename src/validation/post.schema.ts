import z from 'zod';

export const createPostSchema = z.object({
	body: z.object({
		postBody: z.object({
			title: z.string().nonempty(),
			status: z
				.enum(['pending', 'live', 'past', 'inReview'])
				.default('pending'),
			text: z.string().nonempty(),
			image: z.string().nonempty().optional(),
		}),
	}),
});
