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
<<<<<<< HEAD
	NoTimestamps,
} from '../database/abstraction';

import bcrypt from 'bcrypt';

const jwt = require('jsonwebtoken');
=======
	OptionalArrays,
} from '../database/abstraction';
import { Remover, Timestamps } from '../utils/types';
>>>>>>> 32885964e4c315c4229e353cb01096580f1aed98

type Filter = FilterOptions<User>;
type Update = UpdateOptions<User>;
type Options = OptionsQuery<User>;
<<<<<<< HEAD
/* type UserData = NoTimestamps<User>; Comentei esta e criei uma intertface simples */
interface UserData {
	id?: string,
	name: string;
	password: string;
	email: string;
}
=======
type UserData = Remover<User, keyof Timestamps>;
type NewUser = OptionalArrays<
	UserData,
	'groupMembership' | 'groupSubscription'
>;
>>>>>>> 32885964e4c315c4229e353cb01096580f1aed98

class UserService {
	userModel: UserModel;

	constructor() {
		this.userModel = userModel;
	}
<<<<<<< HEAD
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

	createAuthToken(
		user: UserData
	) {
		let authToken = "";
		const jwtSecret: string = process.env.JWT_SECRET || "d3f4ults3cr3t";

		const { id, name, email } = user;
		const payload = { id, name, email };

		return authToken = jwt.sign(
			payload,
			jwtSecret,
			{ algorithm: 'HS256', expiresIn: "6h" },
		);
	}

}


=======
	async createUser(newUser: NewUser) {
		return addToDb(this.userModel, newUser);
	}
}

>>>>>>> 32885964e4c315c4229e353cb01096580f1aed98
export const userService = new UserService();
