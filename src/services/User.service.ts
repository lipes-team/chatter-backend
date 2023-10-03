import { UserModel, User, UserInferred } from '../models/User.model';
import {
	addToDb,
	findOne,
	FilterOptions,
	UpdateOptions,
	OptionsQuery,
	update,
} from '../database/abstraction';

import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';
import { Remover } from '../utils/types';

type Filter = FilterOptions<UserInferred>;
type Update = UpdateOptions<UserInferred>;
type Options = OptionsQuery<UserInferred>;

interface UserData {
	id?: string;
	name: string;
	password: string;
	email: string;
}

class UserService {
	userModel: UserModel;

	constructor() {
		this.userModel = User;
	}
	async createUser(newUser: UserData) {
		let hashedPassword = await this.hashPassword(newUser);
		const userToCreate = {
			...newUser,
			password: hashedPassword,
		};
		return addToDb(this.userModel, userToCreate);
	}

	async hashPassword(newUser: UserData) {
		return bcrypt.hash(newUser.password, 12);
	}

	async compareHashedPassword(plainPassword: string, hashPassword: string) {
		return bcrypt.compare(plainPassword, hashPassword);
	}

	async findUser(filter: Filter, options?: Options) {
		return findOne(this.userModel, filter, options);
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
		return update(this.userModel, filter, newUser, {
			new: true,
			lean: true,
			...options,
		});
	}
}

export const userService = new UserService();
