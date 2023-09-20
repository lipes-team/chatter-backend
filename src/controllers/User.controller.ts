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
			const user = await userService.findUser({ email }, { projection: "+password" })

			if (user === null) {
				throw {
					message: "Email and/or password incorrect",
					status: 400
				};
			}

			const passwordValid = await userService.compareHashedPassword(password, user.password)

			if (!passwordValid) {
				throw {
					message: "Email and/or password incorrect",
					status: 400
				}
			}

			const authToken = userService.createAuthToken({
				name,
				email,
			});

			return res.status(200).json({ authToken: authToken });
		} catch (error: any) {
			error.path = 'Login user';
			next(error);
		}
	}

	async update(
		req: RouteOpts['payload'],
		res: RouteOpts['res'],
		next: RouteOpts['next']
	) {
		try {

			const { id, name, email, } = req.payload!

			const newUser = {
				name: req.body.name,
				password: req.body.password,
				email: req.body.email
			}

			console.log(newUser)
			const updatedUser = await userService.updateUser({ id }, newUser)

			return res.status(200);
		} catch (error: any) {
			error.path = 'Login user';
			next(error);
		}
	}
}

export const userController = new UserController();
