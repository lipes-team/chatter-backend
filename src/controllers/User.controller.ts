import { NoTimestamps } from '../database/abstraction';
import { userService } from '../services/User.service';
import { RouteOpts } from '../utils/types';
import { User } from '../models/User.model';

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
			next(error);
		}
	}
}

export const userController = new UserController();
