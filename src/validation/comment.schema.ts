import z from 'zod';

export const createCommentSchema = z.object({
	body: z.object({
		text: z.string().nonempty(),
		image: z.string().optional(),
	}),
});

export const updateCommentSchema = z.object({
	body: z.object({
		text: z.string().nonempty().optional(),
		image: z.string().optional(),
	}),
});
