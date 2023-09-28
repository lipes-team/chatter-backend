import z from 'zod';

export const createCommentSchema = z.object({
	body: z.object({
		text: z.string().nonempty(),
		image: z.string().optional(),
	}),
});
