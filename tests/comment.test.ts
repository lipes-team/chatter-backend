import { Connection, connect } from 'mongoose';

import {
	postRequest,
	putRequest,
	deleteRequest,
	getRequest,
} from './utils/requestAbstraction';
import { expectResponseBody, expectStatus } from './utils/expectAbstractions';
import { app as application } from '../app';
import { userService } from '../src/services/User.service';
import { NewComment, Comment } from '../src/models/Comment.model';
import { addToDb, deleteOne } from '../src/database/abstraction';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Post } from '../src/models/Post.model';

describe('Comments Controller', () => {
	let database: Connection;
	let PORT = Number(process.env.PORT!);
	let app = application.listen(PORT);
	const commentBody: Partial<NewComment> = {
		text: `This content is really amazing!!`,
	};
	let postId: string;
	let userId: string;
	const baseRoute = '/comments';
	let header = { authorization: '' };
	let differentUserHeader = { authorization: '' };
	let mongod: MongoMemoryServer;
	let model = Comment;
	beforeAll(async () => {
		try {
			mongod = await MongoMemoryServer.create();
			const uri = mongod.getUri();
			database = (await connect(uri)).connection;
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
				userService.createUser(newUser),
				userService.createUser(differentUser),
			]);
			userId = firstUser._id.toString();

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
				await Post.create({
					...newPost,
					owner: userId,
					comments: [],
					history: [],
				})
			)._id.toString();
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

	describe('Token Validation', () => {
		it(`should throw error without auth Token`, async () => {
			const expectRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			const res = await postRequest({ app, route: baseRoute });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
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

			const res = await postRequest({
				app,
				infoSend,
				route,
				header,
			});
			expectStatus(res, 201);
			expectResponseBody(res, expectedRes);
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

			const res = await postRequest({
				app,
				infoSend,
				route,
				header,
			});

			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
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

			const res = await postRequest({
				app,
				infoSend,
				route,
				header,
			});

			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
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

			const res = await postRequest({
				app,
				infoSend,
				route,
				header,
			});

			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw error without authToken`, async () => {
			const route = `${baseRoute}/${postId}`;
			const expectedRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			const res = await postRequest({ app, route });
			expectStatus(res, 401);
			expectResponseBody(res, expectedRes);
		});
	});

	// ==================== READ COMMENT TESTS ====================
	describe('Read comments', () => {
		it(`should get comment by ID`, async () => {
			const comment = await addToDb(model, {
				...commentBody,
				post: postId,
				owner: userId,
			});
			const id = comment._id;
			const route = `${baseRoute}/${id}`;

			const expectedRes = {
				text: comment.text,
			};

			const res = await getRequest({ app, route, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error getting comment by invalid ID`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id.toString();
			const route = `${baseRoute}/${id.slice(0, -5)}`;
			const expectedRes = {
				errors: [
					{
						message: 'Invalid Id',
						path: ['params', 'id', 'Find Comment'],
					},
				],
				path: 'Validation',
			};

			const res = await getRequest({ app, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw error without authToken`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;
			const expectedRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			const res = await getRequest({ app, route });
			expectStatus(res, 401);
			expectResponseBody(res, expectedRes);
		});
	});

	// ==================== UPDATE COMMENT TESTS ====================
	describe('Update comments', () => {
		it(`should update comment text`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;

			const route = `${baseRoute}/${id}`;

			const infoSend = {
				text: `Updates the comment's text`,
			};

			const expectedRes = {
				text: infoSend.text,
			};

			const res = await putRequest({ app, route, infoSend, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should update comment image`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;

			const infoSend = {
				image: `Updates the comment's image`,
			};

			const expectedRes = {
				text: commentBody.text,
				image: infoSend.image,
			};

			const res = await putRequest({ app, route, infoSend, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should update the comment text and the image`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;

			const infoSend = {
				text: `Updates the comment's text simultaneously`,
				image: `Updates the comment's image simultaneously`,
			};

			const expectedRes = {
				text: infoSend.text,
				image: infoSend.image,
			};

			const res = await putRequest({ app, route, infoSend, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when text is an empty string`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;

			const infoSend = {
				text: ``,
			};

			const expectedRes = {
				errors: [
					{
						message: 'String must contain at least 1 character(s)',
						path: ['body', 'text'],
					},
				],
				path: 'Validation',
			};

			const res = await putRequest({ app, route, infoSend, header });
			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when comment isn't found`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;

			await deleteOne(model, { _id: id });

			const infoSend = {
				text: `Testing the error for comment not found`,
			};

			const route = `${baseRoute}/${id}`;

			const expectedRes = {
				errors: [
					{
						message: `Seems that this isn't a comment`,
					},
				],
				path: 'Update comment',
			};

			const res = await putRequest({ app, route, header, infoSend });
			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when trying to update someone's else comment`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;

			const infoSend = {
				text: `Updates the comment's text simultaneously`,
				image: `Updates the comment's image simultaneously`,
			};

			const expectedRes = {
				errors: [{ message: `You aren't allowed to edit this comment` }],
				path: 'Update comment',
			};

			const res = await putRequest({
				app,
				route,
				infoSend,
				header: differentUserHeader,
			});

			expectStatus(res, 401);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error with invalid Id`, async () => {
			const comment = await addToDb(model, {
				...commentBody,
				post: postId,
				owner: userId,
			});

			const id = comment._id.toString();
			const route = `${baseRoute}/${id.slice(0, -5)}`;

			const infoSend = {
				text: `Updates the comment's text simultaneously`,
				image: `Updates the comment's image simultaneously`,
			};

			const expectedRes = {
				errors: [
					{ message: `Invalid Id`, path: ['params', 'id', 'Update Comment'] },
				],
				path: 'Validation',
			};

			const res = await putRequest({
				app,
				route,
				infoSend,
				header: differentUserHeader,
			});

			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw error without authToken`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;
			const expectRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			const res = await putRequest({ app, route });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});
	});

	// ==================== DELETE COMMENT TESTS ====================
	describe('Delete comments', () => {
		it(`should delete comment`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;

			const res = await deleteRequest({ app, route, header });
			expectStatus(res, 204);
		});

		it(`should throw an error trying to delete a comment that doesn't exist`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;

			await deleteOne(model, { _id: id });

			const route = `${baseRoute}/${id}`;

			const expectedRes = {
				errors: [{ message: 'Comment not found' }],
				path: 'Delete comment',
			};

			const res = await deleteRequest({ app, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error trying to delete someone's else comments`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;

			const expectedRes = {
				errors: [{ message: `You aren't allowed to delete this comment` }],
				path: 'Delete comment',
			};

			const res = await deleteRequest({
				app,
				route,
				header: differentUserHeader,
			});
			expectStatus(res, 401);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when trying to delete comment by invalid ID`, async () => {
			const comment = await addToDb(model, {
				...commentBody,
				post: postId,
				owner: userId,
			});

			const id = comment._id.toString();
			const route = `${baseRoute}/${id.slice(0, -5)}`;

			const expectedRes = {
				errors: [
					{ message: `Invalid Id`, path: ['params', 'id', 'Delete Comment'] },
				],
				path: 'Validation',
			};

			const res = await deleteRequest({
				app,
				route,
				header,
			});
			expectStatus(res, 400);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw error without authToken`, async () => {
			const id = (
				await addToDb(model, {
					...commentBody,
					post: postId,
					owner: userId,
				})
			)._id;
			const route = `${baseRoute}/${id}`;
			const expectRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			const res = await deleteRequest({ app, route });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});
	});
});
