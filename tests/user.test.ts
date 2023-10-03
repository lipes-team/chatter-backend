import { Connection, connect } from 'mongoose';

import {
	getRequest,
	postRequest,
	putRequest,
	deleteRequest,
} from './utils/requestAbstraction';
import { expectResponseBody, expectStatus } from './utils/expectAbstractions';
import { app as application } from '../app';
import { findOne, find, addToDb, update } from '../src/database/abstraction';
import { User } from '../src/models/User.model';
import { userService } from '../src/services/User.service';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('User tests', () => {
	let PORT = process.env.PORT!;
	let database: Connection;
	let app = application.listen(PORT);
	let authToken = '';
	let mongod: MongoMemoryServer;
	beforeAll(async () => {
		try {
			mongod = await MongoMemoryServer.create();
			const uri = mongod.getUri();
			database = (await connect(uri)).connection;
			await User.ensureIndexes(); //ensure mongoose validation based on userModel

			let userInfo = {
				name: 'Jane Doe',
				password: 'TestTest123',
				email: 'uniquejane@email.com',
			};

			await userService.createUser(userInfo);

			authToken = userService.createAuthToken({
				name: userInfo.name,
				email: userInfo.email,
			});
		} catch (error) {
			throw error;
		}
	});

	afterAll(async () => {
		await database.dropDatabase();
		await database.close();
		await mongod.stop();
		app.close();
	});

	describe('User controllers', () => {
		it('should throw error message if user signup data invalid', async () => {
			const infoSend = {
				name: 'John Doe',
				password: 'abc1', //invalid password
				email: 'johndoe@email.com',
			};
			const route = '/user/signup';
			const error = {
				errors: [
					{
						message:
							'Invalid password, must contain at least one uppercase letter, one lowercase letter, one number, and is at least 8 characters long',
						path: ['body', 'password'],
					},
				],
			};

			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		});

		it('should create an user', async () => {
			const infoSend = {
				name: 'John Doe',
				password: 'TestTest123', //valid password
				email: 'johndoe@email.com',
			};
			const route = '/user/signup';

			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 201);
		});

		it(`should throw an error when email isn't unique`, async () => {
			const infoSend = {
				name: 'Jane Doe',
				password: 'TestTest123', //valid password
				email: 'uniquejane@email.com',
			};
			const route = '/user/signup';

			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
		});

		it('should login the user', async () => {
			const infoSend = {
				name: 'Jane Doe',
				password: 'TestTest123', //valid password
				email: 'uniquejane@email.com',
			};
			const route = '/user/login';

			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 200);
		});

		it('should update user information', async () => {
			const infoSend = {
				name: 'Updated Jane Doe',
				password: 'TestUpdate123',
				email: 'updatejanedoe@email.com',
			};

			const route = '/user/update';
			const header = {
				Authorization: `Bearer ${authToken}`,
			};

			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 200);
		});
	});

	describe('User services', () => {
		it('should check password in db be hashed and match original password', async () => {
			const userInfo = {
				name: 'Jane Doe',
				password: 'TestTest123', //valid password
				email: 'janedoe@email.com',
			};

			// shallow copy because .createUser changes the original
			const originalUserInfo = { ...userInfo };

			await userService.createUser(userInfo);

			let savedUser = await findOne(User, {
				email: userInfo.email,
			}).select('+password');

			if (savedUser?.password) {
				expect(savedUser.password).not.toEqual(originalUserInfo.password);

				let isHashed = await userService.compareHashedPassword(
					originalUserInfo.password,
					savedUser.password
				);

				expect(isHashed).toBe(true);
			}
		});

		it('should check if user exists in DB', async () => {
			const userInfo = {
				name: 'Jane Doe',
				password: 'TestTest123', //valid password
				email: 'janedoe@email.com',
			};
			const userInDB = await userService.findUser({ email: userInfo.email });

			expect(userInDB).not.toBeNull();
		});

		it('should create a JWToken', async () => {
			let authToken;

			const userInfo = {
				name: 'Jane Doe',
				password: 'TestTest123', //valid password
				email: 'janedoe@email.com',
			};

			let userInDB = await userService.findUser({ email: userInfo.email });

			if (userInDB) {
				authToken = userService.createAuthToken;
			}

			expect(authToken).toBeDefined();
		});

		it('should update user info in db', async () => {
			const oldInfo = {
				name: 'Jane Doe',
				password: 'TestTest123',
				email: 'uniquejane@email.com',
			};

			const newInfo = {
				name: 'Updated Jane Doe',
				password: 'TestUpdate123',
				email: 'updatejanedoe@email.com',
			};

			newInfo.password = await userService.hashPassword(newInfo);

			const oldUser = await userService.findUser(
				{ email: oldInfo.email },
				{ projection: '+password' }
			);
			const newUser = await userService.updateUser(
				{ email: oldInfo.email },
				{ ...newInfo },
				{ projection: '+password' }
			);

			if (oldUser) {
				expect(newUser).not.toMatchObject(oldUser);
			}
		});
	});
});
