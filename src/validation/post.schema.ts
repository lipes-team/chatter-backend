import z from 'zod';

export const createPostSchema = z.object({
	body: z.object({
		title: z.string().nonempty(),
		activePost: z.object({
			text: z.string().nonempty(),
			image: z.string().nonempty().optional(),
		}),
	}),
});

export const updatePostSchema = z.object({
	body: z.object({
		title: z.string().nonempty().optional(),
		activePost: z
			.object({
				text: z.string().nonempty(),
				image: z.string().nonempty().optional(),
			})
			.optional(),
	}),
});
