import { Connection } from 'mongoose';
import { Express } from 'express';

import { disconnectDB } from '../src/database/connection';
import {
	getRequest,
	postRequest,
	putRequest,
	deleteRequest,
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
	let header = { authorization: '' };
	beforeAll(async () => {
		try {
			const { app: application, db } = await initializeApp();
			database = db;
			app = application;
			const newUser = {
				name: 'Felipe',
				email: 'felipe@gmail.com',
				password: 'Aa123456!',
			};

			await postRequest({ app, infoSend: newUser, route: '/user/signup' });
			const res = await postRequest({
				app,
				infoSend: newUser,
				route: '/user/login',
			});
			header.authorization = `Bearer ${res.body.authToken}`;
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

	it(`shouldn't create a new post without the Authorization Token`, async () => {
		const infoSend = { title: postBody.title, postBody };
		const route = '/post';

		const expectRes = {
			errors: [
				{
					message: 'No authorization token was found',
				},
			],
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		}
	});

	it(`shouldn't create a new post with an expired token`, async () => {
		const infoSend = { title: postBody.title, postBody };
		const route = '/post';

		const headers = { ...header };

		headers.authorization = `Bearer ${process.env.EXPIRED!}`;

		const expectRes = {
			errors: [
				{
					message: 'jwt expired',
				},
			],
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header: headers });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		}
	});

	it(`shouldn't create a new post with an invalid signature`, async () => {
		const infoSend = { title: postBody.title, postBody };
		const route = '/post';

		const headers = { ...header };

		headers.authorization = `Bearer ${process.env.EXPIRED!.slice(0, -3)}`;

		const expectRes = {
			errors: [
				{
					message: 'invalid signature',
				},
			],
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header: headers });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		}
	});

	it(`shouldn't create a new post with a malformed token`, async () => {
		const infoSend = { title: postBody.title, postBody };
		const route = '/post';

		const headers = { ...header };

		headers.authorization = `Bearer faketokenlalala.243543$lknmvlwie`;

		const expectRes = {
			errors: [
				{
					message: 'jwt malformed',
				},
			],
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header: headers });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		}
	});

	it('should create a new post', async () => {
		const infoSend = { title: postBody.title, postBody };
		const route = '/post';

		const expectRes = {
			title: expect.any(String),
			postInfo: expect.any(Array<String>),
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 201);
			expectResponseBody(res, expectRes);
		}
	});

	it("shouldn't create a new post", async () => {
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
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}
	});

	it("shouldn't create a new post without the title", async () => {
		const infoSend: { postBody: Partial<typeof postBody>; title?: string } = {
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
					path: ['body', 'title'],
				},
			],
			path: 'Validation',
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}

		infoSend.title = '';
		const errorEmpyTitle = {
			errors: [
				{
					message: 'String must contain at least 1 character(s)',
					path: ['body', 'title'],
				},
			],
			path: 'Validation',
		};
		if (app) {
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, errorEmpyTitle);
		}
	});

	it("shouldn't create a new post without the text", async () => {
		const infoSend: { postBody: Partial<typeof postBody>; title: string } = {
			postBody: { ...postBody },
			title: postBody.title,
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
			const res = await postRequest({ app, infoSend, route, header });
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
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, errorEmpyText);
		}
	});
});
