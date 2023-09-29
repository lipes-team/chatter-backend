import { userModel, User } from '../models/User.model';
import {
	addToDb,
	findOne,
	FilterOptions,
	UpdateOptions,
	OptionsQuery,
	update
} from '../database/abstraction';

import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';
import { Remover } from '../utils/types';

type Filter = FilterOptions<User>;
type Update = UpdateOptions<User>;
type Options = OptionsQuery<User>;

interface UserData {
	id?: string;
	name: string;
	password: string;
	email: string;
}

class UserService {
	userModel: typeof userModel;

	constructor() {
		this.userModel = userModel;
	}
	async createUser(newUser: UserData) {
		let hashedPassword = await this.hashPassword(newUser);
		newUser.password = hashedPassword;
		return addToDb(this.userModel, newUser);
	}

	async hashPassword(newUser: UserData): Promise<string> {

		return bcrypt.hash(newUser.password, 10)

	}

	async compareHashedPassword(
		plainPassword: string,
		hashPassword: string
	): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashPassword)
	}

	async findUser(filter: Filter, options?: Options) {
		return findOne(userModel, filter, options)
	}

	createAuthToken(user: Remover<UserData, 'password'>) {
		let authToken;
		const jwtSecret: string = process.env.JWT_SECRET || 'd3f4ults3cr3t';

		const { id, name, email } = user;
		const payload = { id, name, email };

		return (authToken = jwt.sign(payload, jwtSecret, {
			algorithm: 'HS256',
			expiresIn: '6h',
		}));
	}

	updateUser(filter: Filter, newUser: Update, options?: Options) {
		return update(userModel, filter, newUser, { new: true, lean: true, ...options })
	}
}

export const userService = new UserService();
