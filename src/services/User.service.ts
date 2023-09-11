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
	OptionalArrays,
} from '../database/abstraction';
import { Remover, Timestamps } from '../utils/types';

type Filter = FilterOptions<User>;
type Update = UpdateOptions<User>;
type Options = OptionsQuery<User>;
type UserData = Remover<User, keyof Timestamps>;
type NewUser = OptionalArrays<
	UserData,
	'groupMembership' | 'groupSubscription'
>;

class UserService {
	userModel: UserModel;

	constructor() {
		this.userModel = userModel;
	}
	async createUser(newUser: NewUser) {
		return addToDb(this.userModel, newUser);
	}
}

export const userService = new UserService();
