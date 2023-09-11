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
import { findOne } from '../src/database/abstraction';
import { userModel } from '../src/models/User.model';

describe('POST /users/signup', () => {
	let database: Connection | undefined;
	let app: Express | undefined;
	beforeAll(async () => {
		try {
			const { app: application, db } = await initializeApp();
			database = db;
			app = application;
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

	// it('Check if name and email are unique in DB', async () => {
	// 	const infoSend = {
	// 		name: 'Jane Doe',
	// 		password: 'TestTest123', //valid password
	// 		email: 'janedoe@email.com',
	// 	};
	// 	const route = '/user/signup';

	// 	//Mongoose method for getting the number of documents that matches this filter
	// 	let uniqueNameCount = await userModel.countDocuments({
	// 		name: infoSend.name,
	// 	});
	// 	let uniqueEmailCount = await userModel.countDocuments({
	// 		email: infoSend.email,
	// 	});

	// 	// expect them to be 0
	// 	expect(uniqueNameCount).toBe(0);
	// 	expect(uniqueEmailCount).toBe(0);
	// });

	it.todo('should encrypt recieved password');

	it.todo('should create new user with encrypted password');
});
