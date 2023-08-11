import { Connection } from 'mongoose';

import { PostRoute } from '../src/routes/post.routes';
import { connectDB, disconnectDB } from '../src/database/connection';
import { logger } from '../src/utils/logger';
import {
	getRequest,
	postRequest,
	putRequest,
	deleteRequest,
} from './utils/requestAbstraction';
import { expected } from './utils/expectAbstractions';

describe('Posts Controller', () => {
	let database: Connection | undefined;

	beforeAll(async () => {
		database = await connectDB();
	});

	afterAll(async () => {
		if (database) {
			await database.db.dropDatabase();
		}
		await disconnectDB();
	});

	it('POST/should create a new post', async () => {
		const infoSend = {
			text: 'This is the post test',
			owner: 'Felipe',
			image:
				'https://res.cloudinary.com/dx2ymjepk/image/upload/v1690986732/remote-office/rp3wjqkx0t0w7rqdviz1.jpg',
		};
		const route = '/api/posts';

		try {
			const res = await postRequest({ infoSend, route });
			expected<typeof infoSend>(res, 201, infoSend);
		} catch (error: any) {
			logger.error(error);
		}
	});
});
