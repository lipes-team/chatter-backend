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
import { userService } from '../src/services/User.service';
import { NewComment } from '../src/models/Comment.model';

describe('Comments Controller', () => {
	let database: Connection | undefined;
	let app: Express | undefined;
	const commentBody: Partial<NewComment> = {
		text: `This content is really amazing!!`,
	};
	let postId: string;

	const baseRoute = '/comments';
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

			const [firstUser] = await Promise.all([
				userService.createUser({ ...newUser }),
				userService.createUser({ ...differentUser }),
			]);
			let userId = firstUser._id;

			const [firstUserToken, secondUserToken] = await Promise.all([
				postRequest({ app, infoSend: newUser, route: '/user/login' }),
				postRequest({ app, infoSend: differentUser, route: '/user/login' }),
			]);

			header.authorization = `Bearer ${firstUserToken.body.authToken}`;
			differentUserHeader.authorization = `Bearer ${secondUserToken.body.authToken}`;

			const newPost = {
				activePost: {
					text: `Harness the elegance of async/await, a game-changing duo that simplifies asynchronous programming. 
						 With async functions and await keyword, you can write smoother, more readable code by handling promises gracefully. 
						 Say goodbye to callback hell and embrace a structured, sequential approach to handling asynchronous tasks.`,
				},
				title: 'Mastering the Art of Asynchronous JavaScript',
			};

			postId = (
				await postService.createPost({ ...newPost, owner: userId })
			)._id.toString();
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

	describe('Token Validation', () => {
		it(`should throw error with an expired token`, async () => {
			const infoSend = { ...commentBody };

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
				const res = await postRequest({
					app,
					infoSend,
					route: baseRoute,
					header: headers,
				});
				expectStatus(res, 401);
				expectResponseBody(res, expectRes);
			}
		});

		it(`should throw error without auth Token`, async () => {
			const expectRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			if (app) {
				const res = await postRequest({ app, route: baseRoute });
				expectStatus(res, 401);
				expectResponseBody(res, expectRes);
			}
		});
	});

	// ==================== CREATE COMMENT TESTS ====================
	describe('Create comment', () => {
		it('should create a new comment', async () => {
			const infoSend = { ...commentBody, post: postId };
			const route = `${baseRoute}/${postId}`;
			const expectedRes = {
				text: commentBody.text,
			};

			if (app) {
				const res = await postRequest({
					app,
					infoSend,
					route,
					header,
				});

				expectStatus(res, 201);
				expectResponseBody(res, expectedRes);
			}
		});

		it('should throw with invalid postId', async () => {
			const infoSend = { ...commentBody };
			const route = `${baseRoute}/${postId.slice(0, -5)}`;

			const expectedRes = {
				errors: [
					{
						message: 'Invalid Id',
						path: ['params', 'id', 'Create Comment'],
					},
				],
				path: 'Validation',
			};

			if (app) {
				const res = await postRequest({
					app,
					infoSend,
					route,
					header,
				});

				expectStatus(res, 400);
				expectResponseBody(res, expectedRes);
			}
		});

		it('should throw an error when creating a comment without text', async () => {
			const infoSend = { ...commentBody };
			const route = `${baseRoute}/${postId}`;
			delete infoSend.text;
			const expectedRes = {
				errors: [
					{
						message: 'Required',
						expected: 'string',
						received: 'undefined',
						path: ['body', 'text'],
					},
				],
				path: 'Validation',
			};

			if (app) {
				const res = await postRequest({
					app,
					infoSend,
					route,
					header,
				});

				expectStatus(res, 400);
				expectResponseBody(res, expectedRes);
			}
		});

		it('should throw when text is an empty string', async () => {
			const infoSend = { ...commentBody };
			const route = `${baseRoute}/${postId}`;
			infoSend.text = '';

			const expectedRes = {
				errors: [
					{
						message: 'String must contain at least 1 character(s)',
						path: ['body', 'text'],
					},
				],
				path: 'Validation',
			};

			if (app) {
				const res = await postRequest({
					app,
					infoSend,
					route,
					header,
				});

				expectStatus(res, 400);
				expectResponseBody(res, expectedRes);
			}
		});

		it(`should throw error without auth Token`, async () => {
			const expectRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			if (app) {
				const res = await postRequest({ app, route: baseRoute });
				expectStatus(res, 401);
				expectResponseBody(res, expectRes);
			}
		});
	});

	// ==================== READ COMMENT TESTS ====================
	// describe('Read comments', () => {
	// 	it(`should get comment by ID`, async () => {});

	// 	it(`should throw an error getting comment by invalid ID`, async () => {});
	// it(`should throw error without auth Token`, async () => {

	// 	const expectRes = {
	// 		errors: [
	// 			{
	// 				message: 'No authorization token was found',
	// 			},
	// 		],
	// 	};

	// 	if (app) {
	// 		const res = await postRequest({ app, route });
	// 		expectStatus(res, 401);
	// 		expectResponseBody(res, expectRes);
	// 	}
	// });
	// });

	// ==================== UPDATE COMMENT TESTS ====================
	// describe('Update comments', () => {
	// 	it(`should update comment text`, async () => {});

	// 	it(`should update comment image`, async () => {});

	// 	it(`should update the comment text and the image`, async () => {});
	// it(`should throw error without auth Token`, async () => {

	// 	const expectRes = {
	// 		errors: [
	// 			{
	// 				message: 'No authorization token was found',
	// 			},
	// 		],
	// 	};

	// 	if (app) {
	// 		const res = await postRequest({ app, route });
	// 		expectStatus(res, 401);
	// 		expectResponseBody(res, expectRes);
	// 	}
	// });
	// });

	// ==================== DELETE COMMENT TESTS ====================
	// describe('Delete comments', () => {
	// 	it(`should throw an error trying to delete someone's else comments`, async () => {});

	// 	it(`should throw an error when trying to delete comment by invalid ID`, async () => {});

	// it(`should throw error without auth Token`, async () => {

	// 	const expectRes = {
	// 		errors: [
	// 			{
	// 				message: 'No authorization token was found',
	// 			},
	// 		],
	// 	};

	// 	if (app) {
	// 		const res = await postRequest({ app, route });
	// 		expectStatus(res, 401);
	// 		expectResponseBody(res, expectRes);
	// 	}
	// });

	// 	it(`should delete comment`, async () => {});
	// });
});
