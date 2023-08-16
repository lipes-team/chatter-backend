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

type Filter = FilterOptions<User>;
type Update = UpdateOptions<User>;
type Options = OptionsQuery<User>;
type UserData = NoTimestamps<User>;

class UserService {
	userModel: UserModel;

	constructor() {
		this.userModel = userModel;
	}
	async createUser(newUser: UserData) {
		return addToDb(this.userModel, newUser);
	}
}

export const userService = new UserService();
