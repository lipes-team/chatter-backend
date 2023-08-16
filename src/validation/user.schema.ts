import z from 'zod';

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export const createUserSchema = z.object({
	body: z.object({
		name: z.string().nonempty(),
		password: z.string().regex(passwordRegex, {
			message:
				'Invalid password, must contain at least one uppercase letter, one lowercase letter, one number, and is at least 8 characters long',
		}),
		email: z.string().email(),
	}),
});
