import { userService } from '../services/User.service';
import { RouteOpts } from '../utils/types';

class UserController {
	async create(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { name, password, email } = req.body;
			const newUser = await userService.createUser({ name, password, email });
			return res.status(201).json(newUser);
		} catch (error: any) {
			error.path = 'Create new user';
			if (error.message.includes('duplicate key error')) {
				error.status = 400;
				error.message = 'Email must be unique';
			}
			next(error);
		}
	}

	async login(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {
			const { name, password, email } = req.body;
			const authToken = await userService.createAuthToken({
				name,
				password,
				email,
			});

			return res.status(200).json({ authToken: authToken });
		} catch (error: any) {
			error.path = 'Login user';
			next(error);
		}
	}
}

export const userController = new UserController();
