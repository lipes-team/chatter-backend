import { Connection, connect } from 'mongoose';

import {
	addToDb,
	find,
	findOne,
	update,
	deleteOne,
	deleteMany,
} from '../src/database/abstraction';
import { User } from '../src/models/User.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Database Abstraction', () => {
	let database: Connection;
	let mongod: MongoMemoryServer;

	const Model = User;
	const userTestData = {
		name: 'John Doe',
		password: 'secretpass123',
		email: 'johndoe@test.com',
	};
	const name = 'Alice Bob';
	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();
		database = (await connect(uri)).connection;
		expect(database).toBeDefined();
		await Model.ensureIndexes();
	});

	afterAll(async () => {
		await database.dropDatabase();
		await database.close();
		await mongod.stop();
	});

	it('should create an entry on the database', async () => {
		try {
			const testUser = await addToDb(Model, userTestData);

			// Check if the test user matches the expected data without timestamps
			expect(testUser).toEqual(expect.objectContaining(userTestData));
		} catch (error) {
			throw error;
		}
	});

	it('should find an entry on the database', async () => {
		try {
			const testUsers = await find(Model, { name: userTestData.name }).select(
				'+password'
			);
			expect(testUsers[0]).toEqual(expect.objectContaining(userTestData));
		} catch (error) {
			throw error;
		}
	});

	it('should find entries on the database', async () => {
		try {
			const testUsers = await find(Model);
			expect(testUsers.length).toBeGreaterThan(0);
		} catch (error) {
			throw error;
		}
	});

	it('should findOne an entry on the database', async () => {
		try {
			const testUser = await findOne(Model, { name: userTestData.name }).select(
				'+password'
			);
			expect(testUser).toEqual(expect.objectContaining(userTestData));
		} catch (error) {
			throw error;
		}
	});

	it('should update an entry on the database', async () => {
		try {
			const testUser = await update(
				Model,
				{ name: userTestData.name },
				{ name },
				{ new: true }
			).select('+password');
			const userUpdated = { ...userTestData };
			userUpdated.name = name;
			expect(testUser).toEqual(expect.objectContaining(userUpdated));
		} catch (error) {
			throw error;
		}
	});

	it('should delete an entry from the database', async () => {
		try {
			const res = await deleteOne(Model, { name }).select('+password');
			const expectedUser = { ...userTestData, name };
			expect(res).toEqual(expect.objectContaining(expectedUser));
		} catch (error) {
			throw error;
		}
	});

	it('should delete entries from the database', async () => {
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
			throw error;
		}
	});
});
