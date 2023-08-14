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

describe('Posts Controller', () => {
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

	it('POST/should create a new post', async () => {
		const infoSend = {
			title: 'This is the post test',
		};
		const route = '/post';

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 201);
			expectResponseBody(res, infoSend);
		}
	});

	it("POST/shouldn't create a new post", async () => {
		const infoSend = {};
		const route = '/post';
		const error = {
			errors: [
				{
					message: 'Required',
					expected: 'string',
					received: 'undefined',
					path: ['body', 'title'],
				},
			],
			path: 'Validation',
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}
	});
});
