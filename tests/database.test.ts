import { Connection } from 'mongoose';

import { addToDb, find, findOne, update } from '../src/database/abstraction';
import { userModel } from '../src/models/User.model';
import { connectDB, disconnectDB } from '../src/database/connection';

describe('Mongoose Abstraction', () => {
	let database: Connection | undefined;

	const Model = userModel;
	const userTestData = {
		name: 'John Doe',
		password: 'secretpass123',
		email: 'johndoe@test.com',
	};
	beforeAll(async () => {
		database = await connectDB();
		expect(database).toBeDefined();
	});

	afterAll(async () => {
		await disconnectDB();
	});

	it('create abstraction', async () => {
		const testUser = await addToDb(Model, userTestData);

		// Check if the test user matches the expected data without timestamps
		expect(testUser).toMatchObject(userTestData);
	});

	it('find abstraction', async () => {
		const testUser = await find(Model, { name: userTestData.name });

		expect(testUser).toMatchObject(userTestData);
	});
});
