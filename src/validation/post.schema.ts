import z from 'zod';

export const createPostSchema = z.object({
	body: z.object({
		title: z.string().nonempty(),
		postBody: z.object({
			text: z.string().nonempty(),
			image: z.string().nonempty().optional(),
		}),
	}),
});

export const updatePostSchema = z.object({
	body: z.object({
		title: z.string().nonempty().optional(),
		postBody: z
			.object({
				status: z
					.enum(['pending', 'live', 'past', 'inReview'])
					.default('pending'),
				text: z.string().nonempty(),
				image: z.string().nonempty().optional(),
			})
			.optional(),
	}),
});
