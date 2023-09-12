import { userModel, User, UserModel } from '../models/User.model';
import {
	addToDb,
	find,
	findOne,
	deleteOne,
	update,
	FilterOptions,
	UpdateOptions,
	OptionsQuery,
	NoTimestamps,
} from '../database/abstraction';

import bcrypt from 'bcrypt';

type Filter = FilterOptions<User>;
type Update = UpdateOptions<User>;
type Options = OptionsQuery<User>;
/* type UserData = NoTimestamps<User>; Comentei esta e criei uma intertface simples */
interface UserData {
	name: string;
	password: string;
	email: string;
}

class UserService {
	userModel: UserModel;

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

	async checkUser(
		email: string,
		password: string
	) {
		try {
			let user: UserData = await findOne(userModel, { email }).select(
				'+password'
			);

			// If user exists, check password

			return {
				userExists: await this.compareHashedPassword(password, user.password),
				userInfo: user
			}
		} catch (error) {
			console.error(error);
		}

		//returns false by default
		return false;

	}

}


export const userService = new UserService();
