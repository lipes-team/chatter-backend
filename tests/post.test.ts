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
	const postBody = {
		text: `Harness the elegance of async/await, a game-changing duo that simplifies asynchronous programming. 
			 With async functions and await keyword, you can write smoother, more readable code by handling promises gracefully. 
			 Say goodbye to callback hell and embrace a structured, sequential approach to handling asynchronous tasks.`,
		title: 'Mastering the Art of Asynchronous JavaScript',
	};
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

	it("shouldn't create a new post", async () => {
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

	it("shouldn't create a new post without the title", async () => {
		const infoSend: { postBody: Partial<typeof postBody> } = {
			postBody: { ...postBody },
		};
		delete infoSend.postBody.title;
		const route = '/post';
		const error = {
			errors: [
				{
					message: 'Required',
					expected: 'string',
					received: 'undefined',
					path: ['body', 'postBody', 'title'],
				},
			],
			path: 'Validation',
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}

		infoSend.postBody.title = '';
		const errorEmpyTitle = {
			errors: [
				{
					message: 'String must contain at least 1 character(s)',
					path: ['body', 'postBody', 'title'],
				},
			],
			path: 'Validation',
		};
		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, errorEmpyTitle);
		}
	});

	it("shouldn't create a new post without the text", async () => {
		const infoSend: { postBody: Partial<typeof postBody> } = {
			postBody: { ...postBody },
		};
		delete infoSend.postBody.text;
		const route = '/post';
		const error = {
			errors: [
				{
					message: 'Required',
					expected: 'string',
					received: 'undefined',
					path: ['body', 'postBody', 'text'],
				},
			],
			path: 'Validation',
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}

		infoSend.postBody.text = '';
		const errorEmpyText = {
			errors: [
				{
					message: 'String must contain at least 1 character(s)',
					path: ['body', 'postBody', 'text'],
				},
			],
			path: 'Validation',
		};
		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 400);
			expectResponseBody(res, errorEmpyText);
		}
	});
});
