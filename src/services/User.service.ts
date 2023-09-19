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
		return new Promise((resolve, reject) => {
			bcrypt.hash(newUser.password, 10, function (error, hash) {
				if (error) {
					reject(error);
				} else {
					resolve(hash);
				}
			});
		});
	}

	async compareHashedPassword(
		plainPassword: string,
		hashPassword: string
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			bcrypt.compare(plainPassword, hashPassword, function (error, result) {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}

	async findUser(email: string) {
		return findOne(userModel, { email }).select(
			'+password'
		);
	}

	createAuthToken(user: Remover<UserData, "password">) {
		let authToken
		const jwtSecret: string = process.env.JWT_SECRET || 'd3f4ults3cr3t';

		const { id, name, email } = user;
		const payload = { id, name, email };

		return authToken = jwt.sign(payload, jwtSecret, {
			algorithm: 'HS256',
			expiresIn: '6h',
		});
	}

	updateUser(oldEmail: string, newUser: UserData) {
		return update(userModel, { email: oldEmail }, newUser, { new: true, lean: true })
	}
}

export const userService = new UserService();
