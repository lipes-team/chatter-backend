import { Connection, Types } from 'mongoose';
import { Express } from 'express';

import { disconnectDB } from '../src/database/connection';
import {
	postRequest,
	putRequest,
	deleteRequest,
	getRequest,
} from './utils/requestAbstraction';
import { expectResponseBody, expectStatus } from './utils/expectAbstractions';
import { logger } from '../src/utils/logger';
import { initializeApp } from '../app';
import { postService } from '../src/services/Post.service';

describe('Posts Controller', () => {
	let database: Connection | undefined;
	let app: Express | undefined;
	const postBody = {
		activePost: {
			text: `Harness the elegance of async/await, a game-changing duo that simplifies asynchronous programming. 
				 With async functions and await keyword, you can write smoother, more readable code by handling promises gracefully. 
				 Say goodbye to callback hell and embrace a structured, sequential approach to handling asynchronous tasks.`,
		},
		title: 'Mastering the Art of Asynchronous JavaScript',
	};

	const route = '/posts';
	let userId: string;
	let header = { authorization: '' };
	let differentUserHeader = { authorization: '' };
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

			const differentUser = {
				name: 'Felipe',
				email: 'felipe2@gmail.com',
				password: 'Aa123456!',
			};

			const firstUser = postRequest({
				app,
				infoSend: newUser,
				route: '/user/signup',
			});

			const secondUser = postRequest({
				app,
				infoSend: differentUser,
				route: '/user/signup',
			});
			const [firstId] = await Promise.all([firstUser, secondUser]);
			userId = firstId.body._id;

			const firstUserRes = postRequest({
				app,
				infoSend: newUser,
				route: '/user/login',
			});
			const secondUserRes = postRequest({
				app,
				infoSend: differentUser,
				route: '/user/login',
			});

			const [userHeader, differentHeader] = await Promise.all([
				firstUserRes,
				secondUserRes,
			]);

			header.authorization = `Bearer ${userHeader.body.authToken}`;
			differentUserHeader.authorization = `Bearer ${differentHeader.body.authToken}`;
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

	// ==================== CREATE POST TESTS ====================
	it('should create a new post', async () => {
		const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

		const expectRes = {
			title: expect.any(String),
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 201);
			expectResponseBody(res, expectRes);
		}
	});

	it(`shouldn't create a new post without the Authorization Token`, async () => {
		const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

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
		const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

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
		const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

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
		const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

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

	it("shouldn't create a new post", async () => {
		const infoSend = {};

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
					path: ['body', 'activePost'],
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
		const infoSend: {
			activePost: typeof postBody.activePost;
			title?: string;
		} = { ...postBody, activePost: { ...postBody.activePost } };
		delete infoSend.title;
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
		const infoSend: {
			activePost: Partial<typeof postBody.activePost>;
			title: string;
		} = { ...postBody, activePost: { ...postBody.activePost } };

		delete infoSend.activePost.text;

		const error = {
			errors: [
				{
					message: 'Required',
					expected: 'string',
					received: 'undefined',
					path: ['body', 'activePost', 'text'],
				},
			],
			path: 'Validation',
		};

		if (app) {
			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		}

		infoSend.activePost.text = '';
		const errorEmpyText = {
			errors: [
				{
					message: 'String must contain at least 1 character(s)',
					path: ['body', 'activePost', 'text'],
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

	// ==================== UPDATE POST TESTS ====================
	it(`should update post title`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const infoSend = { title: 'Updated title' };
		const postRoute = `${route}/${newPost._id}`;

		if (app) {
			const res = await putRequest({ app, infoSend, route: postRoute, header });
			expectStatus(res, 200);
			expectResponseBody(res, { title: infoSend.title });
		}
	});

	it(`should update the post info`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;
		const infoSend = { editPropose: { ...postBody.activePost } };

		const expectedRes = {
			editPropose: {
				text: infoSend.editPropose.text,
			},
			toUpdate: true,
		};

		if (app) {
			const res = await putRequest({ app, infoSend, route: postRoute, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		}
	});

	it(`should update the post info and the title`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;

		const infoSend = {
			editPropose: {
				text: 'Edit proposal',
			},
			title: 'Updates simultaneously',
		};

		const expectedRes = {
			title: 'Updates simultaneously',
			editPropose: {
				text: 'Edit proposal',
			},
			toUpdate: true,
		};

		if (app) {
			const res = await putRequest({ app, infoSend, route: postRoute, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		}
	});

	it(`shouldn't update the post you don't own`, async () => {
		const infoSend = {
			activePost: { ...postBody.activePost },
			title: 'Updates simultaneously',
		};

		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;

		const expectedRes = {
			errors: [
				{
					message: `The post was deleted and/or you aren't the owner`,
				},
			],
			path: 'Update a post',
		};

		if (app) {
			const res = await putRequest({
				app,
				infoSend,
				route: postRoute,
				header: differentUserHeader,
			});
			expectStatus(res, 401);
			expectResponseBody(res, expectedRes);
		}
	});

	it(`shouldn't update a post without the Authorization Token`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;
		const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

		const expectRes = {
			errors: [
				{
					message: 'No authorization token was found',
				},
			],
		};

		if (app) {
			const res = await putRequest({ app, infoSend, route: postRoute });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		}
	});

	// ==================== DELETE POST TESTS ====================
	it(`shouldn't delete a post from another user`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;

		const expectRes = {
			errors: [
				{
					message: `The post was deleted and/or you aren't the owner`,
				},
			],
			path: 'Delete a post',
		};

		if (app) {
			const res = await deleteRequest({
				app,
				route: postRoute,
				header: differentUserHeader,
			});
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		}
	});

	it(`shouldn't delete a post with the wrong ID`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id.toString().slice(0, -3)}`;

		const expectRes = {
			errors: [
				{
					message: 'Invalid Id',
					path: ['params', 'id', 'Delete'],
				},
			],
			path: 'Validation',
		};

		if (app) {
			const res = await deleteRequest({
				app,
				route: postRoute,
				header,
			});
			expectStatus(res, 400);
			expectResponseBody(res, expectRes);
		}
	});

	it(`should delete a post`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;

		if (app) {
			const res = await deleteRequest({
				app,
				route: postRoute,
				header,
			});
			expectStatus(res, 204);
		}
	});

	// ==================== READ POST TESTS ====================
	it(`should get one post by ID`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const postRoute = `${route}/${newPost._id}`;

		const expectedRes = {
			activePost: {
				text: postToCreate.activePost.text,
			},
			status: 'pending',
		};

		if (app) {
			const res = await getRequest({
				app,
				route: postRoute,
				header,
			});

			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		}
	});

	it(`shouldn't get one post by invalid ID`, async () => {
		const postToCreate = {
			...postBody,
			activePost: { ...postBody.activePost },
		};

		const newPost = await postService.createPost({
			...postToCreate,
			owner: userId,
		});

		const expectRes = {
			errors: [
				{
					message: 'Invalid Id',
					path: ['params', 'id', 'Get one'],
				},
			],
			path: 'Validation',
		};

		const postRoute = `${route}/${newPost._id.toString().slice(0, -3)}`;

		if (app) {
			const res = await getRequest({
				app,
				route: postRoute,
				header,
			});

			expectStatus(res, 400);
			expectResponseBody(res, expectRes);
		}
	});
});
