import { Connection, connect } from 'mongoose';

import {
	postRequest,
	putRequest,
	deleteRequest,
	getRequest,
} from './utils/requestAbstraction';
import { expectResponseBody, expectStatus } from './utils/expectAbstractions';
import { app as application } from '../app';
import { postService } from '../src/services/Post.service';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Posts Controller', () => {
	let PORT = Number(process.env.PORT!);
	let database: Connection;
	let app = application.listen(PORT);
	let mongod: MongoMemoryServer;
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
		console.log(process.env.EXPIRED);
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
			throw error;
		}
	});

	afterAll(async () => {
		await database.dropDatabase();
		await database.close();
		await mongod.stop();
		app.close();
	});

	// ==================== CREATE POST TESTS ====================
	describe('Create post', () => {
		it('should create a new post', async () => {
			const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

			const expectRes = {
				title: expect.any(String),
			};

			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 201);
			expectResponseBody(res, expectRes);
		});

		it(`should throw without the Authorization Token`, async () => {
			const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

			const expectRes = {
				errors: [
					{
						message: 'No authorization token was found',
					},
				],
			};

			const res = await postRequest({ app, infoSend, route });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});

		it(`should throw with an expired token`, async () => {
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

			const res = await postRequest({ app, infoSend, route, header: headers });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});

		it(`should throw  with an invalid signature`, async () => {
			const infoSend = { ...postBody, activePost: { ...postBody.activePost } };

			const headers = { ...header };

			headers.authorization = headers.authorization.slice(0, -5);

			const expectRes = {
				errors: [
					{
						message: 'invalid signature',
					},
				],
			};

			const res = await postRequest({ app, infoSend, route, header: headers });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});

		it(`should throw  with a malformed token`, async () => {
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

			const res = await postRequest({ app, infoSend, route, header: headers });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});

		it('should throwan error with empty info', async () => {
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

			const res = await postRequest({ app, infoSend, route, header });
			expectStatus(res, 400);
			expectResponseBody(res, error);
		});

		it('should throw an error when trying to create post without the title', async () => {
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

			const noTitleRes = await postRequest({ app, infoSend, route, header });
			expectStatus(noTitleRes, 400);
			expectResponseBody(noTitleRes, error);

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

			const emptyStringTitleRes = await postRequest({
				app,
				infoSend,
				route,
				header,
			});
			expectStatus(emptyStringTitleRes, 400);
			expectResponseBody(emptyStringTitleRes, errorEmpyTitle);
		});

		it('should throw an error when trying to create a post without the text', async () => {
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

			const noActivePostRes = await postRequest({
				app,
				infoSend,
				route,
				header,
			});
			expectStatus(noActivePostRes, 400);
			expectResponseBody(noActivePostRes, error);

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

			const emptyActivePostRes = await postRequest({
				app,
				infoSend,
				route,
				header,
			});
			expectStatus(emptyActivePostRes, 400);
			expectResponseBody(emptyActivePostRes, errorEmpyText);
		});
	});

	// ==================== READ POST TESTS ====================
	describe('Read post', () => {
		it(`should get one post by ID`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
			});

			const postRoute = `${route}/${newPost._id}`;

			const expectedRes = {
				activePost: {
					text: postToCreate.activePost.text,
				},
				status: 'pending',
			};

			const res = await getRequest({
				app,
				route: postRoute,
				header,
			});

			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when trying to find post by invalid ID`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
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

			const res = await getRequest({
				app,
				route: postRoute,
				header,
			});

			expectStatus(res, 400);
			expectResponseBody(res, expectRes);
		});
	});

	// ==================== UPDATE POST TESTS ====================
	describe('Update post', () => {
		it(`should update post title`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
			});

			const infoSend = { title: 'Updated title' };
			const postRoute = `${route}/${newPost._id}`;

			const res = await putRequest({ app, infoSend, route: postRoute, header });
			expectStatus(res, 200);
			expectResponseBody(res, { title: infoSend.title });
		});

		it(`should update the post info`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
			});

			const postRoute = `${route}/${newPost._id}`;
			const infoSend = { editPropose: { ...postBody.activePost } };

			const expectedRes = {
				editPropose: {
					text: infoSend.editPropose.text,
				},
				toUpdate: true,
			};

			const res = await putRequest({ app, infoSend, route: postRoute, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should update the post info and the title`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
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

			const res = await putRequest({ app, infoSend, route: postRoute, header });
			expectStatus(res, 200);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when trying to update post the user don't own`, async () => {
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
				history: [],
				comments: [],
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

			const res = await putRequest({
				app,
				infoSend,
				route: postRoute,
				header: differentUserHeader,
			});
			expectStatus(res, 401);
			expectResponseBody(res, expectedRes);
		});

		it(`should throw an error when trying to update post without the Authorization Token`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
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

			const res = await putRequest({ app, infoSend, route: postRoute });
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});
	});

	// ==================== DELETE POST TESTS ====================
	describe('Delete post', () => {
		it(`should throw an error when trying to delete post the user don't own`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
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

			const res = await deleteRequest({
				app,
				route: postRoute,
				header: differentUserHeader,
			});
			expectStatus(res, 401);
			expectResponseBody(res, expectRes);
		});

		it(`should throw an error when trying to delete a post with the wrong ID`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
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

			const res = await deleteRequest({
				app,
				route: postRoute,
				header,
			});
			expectStatus(res, 400);
			expectResponseBody(res, expectRes);
		});

		it(`should delete a post`, async () => {
			const postToCreate = {
				...postBody,
				activePost: { ...postBody.activePost },
			};

			const newPost = await postService.createPost({
				...postToCreate,
				owner: userId,
				history: [],
				comments: [],
			});

			const postRoute = `${route}/${newPost._id}`;

			const res = await deleteRequest({
				app,
				route: postRoute,
				header,
			});
			expectStatus(res, 204);
		});
	});
});
