import { Connection } from 'mongoose';
import { Express } from 'express';

import { disconnectDB } from '../src/database/connection';
import {
	getRequest,
	postRequest,
	putRequest,
	deleteRequest,
	RequestTypes,
} from './utils/requestAbstraction';
import { expectResponseBody, expectStatus } from './utils/expectAbstractions';
import { logger } from '../src/utils/logger';
import { initializeApp } from '../app';
import { findOne, find, addToDb } from '../src/database/abstraction';
import { userModel } from '../src/models/User.model';
import { userService } from '../src/services/User.service';

describe.only('User Services', () => {
	let database: Connection | undefined;
	let app: Express | undefined;
	beforeAll(async () => {
		try {
			const { app: application, db } = await initializeApp();
			database = db;
			app = application;
			await userModel.ensureIndexes();  //ensure mongoose validation based on userModel

			let userInfo = {
				name: 'Jane Doe',
				password: 'TestTest123',
				email: 'uniquejane@email.com',
			};

			let user = await userService.createUser(userInfo);
		} catch (error) {
			logger.error(error);
			// TODO: should throw an error here too?
		}
	});

	afterAll(async () => {
		try {
			await database?.db.dropDatabase();
			await disconnectDB();
		} catch (error) {
			logger.error(error);
		}
	});

	it('CONTROLER: throw error message if user signup data invalid', async () => {
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

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}
	});

	it('CONTROLER (signup): No error if user signup data is valid', async () => {
		const infoSend = {
			name: 'John Doe',
			password: 'TestTest123', //valid password
			email: 'johndoe@email.com',
		};
		const route = '/user/signup';
		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 201);
		}
	});

	it('CONTROLER (signup): Respond with 400 and simple message if email is not unique', async () => {
		const infoSend = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'uniquejane@email.com',
		};
		const route = '/user/signup';
		await find(userModel, { email: infoSend.email });
		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
		}
	});

	it('SERVICE: Password in db should be hashed and match original password', async () => {
		const userInfo = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'janedoe@email.com',
		};

		// shallow copy because .createUser changes the original
		const originalUserInfo = { ...userInfo };

		await userService.createUser(userInfo);

		let savedUser = await findOne(userModel, { email: userInfo.email }).select(
			'+password'
		);

		if (savedUser?.password) {
			expect(savedUser.password).not.toEqual(originalUserInfo.password);

			let isHashed = await userService.compareHashedPassword(
				originalUserInfo.password,
				savedUser.password
			);

			expect(isHashed).toBe(true);
		}
	});

	it('SERVICE: should check if user exists in DB', async () => {
		const userInfo = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'janedoe@email.com',
		};
		const userInDB = await userService.findUser(
			userInfo.email
		);

		expect(userInDB).not.toBeNull();
	});

	it('SERVICE: Should create a JWToken', async () => {
		let authToken;

		const userInfo = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'janedoe@email.com',
		};

		let userInDB = await userService.findUser(
			userInfo.email,
		);

		if (userInDB) {
			authToken = userService.createAuthToken
		}

		expect(authToken).toBeDefined();
	});

	it('CONTROLER (login): Should respond 200 if user logins with valid info', async () => {
		const infoSend = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'uniquejane@email.com',
		};
		const route = '/user/login';

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 200);
		}
	});
});
