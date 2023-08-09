import { Connection } from 'mongoose';

import {
	addToDb,
	find,
	findOne,
	update,
	deleteOne,
	deleteMany,
} from '../src/database/abstraction';
import { userModel } from '../src/models/User.model';
import { connectDB, disconnectDB } from '../src/database/connection';
import { logger } from '../src/utils/logger';

describe('Mongoose Abstraction', () => {
	let database: Connection | undefined;

	const Model = userModel;
	const userTestData = {
		name: 'John Doe',
		password: 'secretpass123',
		email: 'johndoe@test.com',
	};
	const name = 'Alice Bob';
	beforeAll(async () => {
		database = await connectDB();
		expect(database).toBeDefined();
		await Model.ensureIndexes();
	});

	afterAll(async () => {
		if (database) {
			await database.dropDatabase();
		}
		await disconnectDB();
	});

	it('create abstraction', async () => {
		try {
			const testUser = await addToDb(Model, userTestData);

			// Check if the test user matches the expected data without timestamps
			expect(testUser).toMatchObject(userTestData);
		} catch (error) {
			logger.error(error);
		}
	});

	it('find abstraction', async () => {
		try {
			const testUser = await find(Model, { name: userTestData.name }).select(
				'+password'
			);
			expect(testUser[0]).toMatchObject(userTestData);
		} catch (error) {
			logger.error(error);
		}
	});

	it('find one abstraction', async () => {
		try {
			const testUser = await findOne(Model, { name: userTestData.name }).select(
				'+password'
			);
			expect(testUser).toMatchObject(userTestData);
		} catch (error) {
			logger.error(error);
		}
	});

	it('update abstraction', async () => {
		try {
			const testUser = await update(
				Model,
				{ name: userTestData.name },
				{ name },
				{ new: true }
			).select('+password');
			const userUpdated = { ...userTestData };
			userUpdated.name = name;
			expect(testUser).toMatchObject(userUpdated);
		} catch (error) {
			logger.error(error);
		}
	});

	it('delete abstraction', async () => {
		try {
			const res = await deleteOne(Model, { name });

			expect(res).toMatchObject({ acknowledged: true, deletedCount: 1 });
		} catch (error) {
			logger.error(error);
		}
	});

	it('delete many abstraction', async () => {
		const users = [
			{
				name: 'John Doe',
				password: 'secretpass123',
				email: 'johndoe@test.com',
			},
			{
				name: 'John Doe',
				password: 'secretpass123',
				email: 'johndoe2@test.com',
			},
		];

		try {
			await addToDb(Model, users);
			const res = await deleteMany(Model, { name: userTestData.name });
			expect(res).toMatchObject({ acknowledged: true, deletedCount: 2 });
		} catch (error) {
			logger.error(error);
		}
	});
});
