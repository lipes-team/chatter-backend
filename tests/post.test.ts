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
			if (database) {
				await database.db.dropDatabase();
			}
			await disconnectDB();
		} catch (error) {
			logger.error(error);
		}
	});

	it('POST/should create a new post', async () => {
		const infoSend = {
			postBody: {
				title: 'This is the post test',
				text: 'Text example',
			},
		};
		const route = '/post';

		const expecxtRes = {
			__v: expect.any(Number),
			_id: expect.any(String),
			comments: expect.any(Array<String>),
			createdAt: expect.any(String),
			postInfo: expect.any(Array<String>),
			updatedAt: expect.any(String),
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 201);
			expectResponseBody(res, expecxtRes);
		}
	});

	it("POST/shouldn't create a new post", async () => {
		const infoSend = {};
		const route = '/post';
		const error = {
			errors: [
				{
					message: 'Required',
					expected: 'object',
					received: 'undefined',
					path: ['body', 'postBody'],
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
