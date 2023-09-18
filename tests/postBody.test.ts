import { Connection, Types } from 'mongoose';
import { connectDB, disconnectDB } from '../src/database/connection';
import { userModel } from '../src/models/User.model';
import { postBodyService } from '../src/services/PostBody.service';
import { postModel } from '../src/models/Post.model';

describe('Post Body Services', () => {
	let database: Connection | undefined;
	let user: Types.ObjectId | undefined;
	const postBody = {
		owner: user!,
		text: `Harness the elegance of async/await, a game-changing duo that simplifies asynchronous programming. 
           With async functions and await keyword, you can write smoother, more readable code by handling promises gracefully. 
           Say goodbye to callback hell and embrace a structured, sequential approach to handling asynchronous tasks.`,
		title: 'Mastering the Art of Asynchronous JavaScript',
	};

	beforeAll(async () => {
		database = await connectDB();
		let [name, password, email] = ['felipe', '12345678', 'felipe@gmail.com'];
		const newUser = await userModel.create({ name, password, email });
		user = newUser._id;
	});

	afterAll(async () => {
		if (database) {
			await database.db.dropDatabase();
		}
		await disconnectDB();
	});

	test('Create postBody with the default status as pending', async () => {
		const newBody = await postBodyService.createPostBody(postBody);
		expect(newBody).toEqual(
			expect.objectContaining({
				text: postBody.text,
				status: 'pending',
				owner: postBody.owner,
			})
		);
	});

	test('should error when trying to create a postBody without text', async () => {
		try {
			const body: Partial<typeof postBody> = { ...postBody };
			delete body.text;
			//@ts-expect-error
			await postBodyService.createPostBody(body);
		} catch (error) {
			expect(error).not.toBeNull();
		}
	});

	test('should error when trying to create a postBody without owner', async () => {
		try {
			const body: Partial<typeof postBody> = { ...postBody };
			delete body.owner;
			//@ts-expect-error
			await postBodyService.createPostBody(body);
		} catch (error) {
			expect(error).not.toBeNull();
		}
	});

	it(`It should delete many postBodies through the _id's`, async () => {
		const body = { ...postBody };
		const creationArray = [1, 2, 3].map((x) =>
			postBodyService.createPostBody(body)
		);
		const createArray = await Promise.all(creationArray);

		const [id1, id2, id3] = [
			createArray[0]._id,
			createArray[1]._id,
			createArray[2]._id,
		];
		const postBodies = [id1, id2, id3];
		const newPost = await postModel.create({
			title: postBody.title,
			postInfo: postBodies,
		});
		const deleteArray = newPost.postInfo.map((post) =>
			postBodyService.deleteOneBody({ _id: post._id })
		);

		const deletion = await Promise.all(deleteArray);
		const expectArray = [
			{ acknowledged: true, deletedCount: 1 },
			{ acknowledged: true, deletedCount: 1 },
			{ acknowledged: true, deletedCount: 1 },
		];

		expect(deletion).toEqual(expect.arrayContaining(expectArray));
	});
});
