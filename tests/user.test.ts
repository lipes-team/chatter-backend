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

describe.only('POST /users/signup', () => {
	let database: Connection | undefined;
	let app: Express | undefined;
	beforeAll(async () => {
		try {
			const { app: application, db } = await initializeApp();
			database = db;
			app = application;
			await userModel.ensureIndexes(); //ensure mongoose validation based on userModel

			let userInfo = {
				name: 'Jane Doe',
				password: 'TestTest123',
				email: 'janedoe@email.com',
			};

			let user = await addToDb(userModel, userInfo);
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

	it('throw error message if user data invalid', async () => {
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

	it('No error if user data is valid', async () => {
		const infoSend = {
			name: 'John Doe',
			password: 'TestTest123', //valid password
			email: 'johndoe@email.com',
		};
		const route = '/user/signup';

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 201);
			expectResponseBody(res, infoSend);
		}
	});

	it('400 error and simple message if email is not unique', async () => {
		const infoSend = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'janedoe@email.com',
		};
		const route = '/user/signup';

		await find(userModel, { email: infoSend.email });

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
		}
	});

	it('Password in db should be encripted', async () => {
		const userInfo = {
			name: 'Jane Doe',
			password: 'TestTest123', //valid password
			email: 'janedoe@email.com',
		};

		let savedUser = await findOne(userModel, { email: userInfo.email }).select(
			'+password'
		);

		console.log(savedUser, userInfo);
		if (savedUser?.password) {
			expect(userInfo.password).not.toBe(savedUser.password);
		}
	});

	it.todo('should create new user with encrypted password');
});
