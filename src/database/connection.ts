import { logger } from '../utils/logger';
import { connect, disconnect } from 'mongoose';

const MONGODB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatter';
const isDev = process.env.NODE_ENV === 'dev';

export const connectDB = async () => {
	try {
		// TODO: check if we can/should change the timeout
		const { connection } = await connect(MONGODB, {
			autoIndex: isDev, //if we dont do this we'll need to create the indexes manually
			socketTimeoutMS: 0,
		});

		logger.info(`Connect to ${connection.name} database`);

		return connection;
	} catch (error) {
		logger.error(error);
	}
};

export const disconnectDB = async () => {
	await disconnect();
	logger.info('Closed connection to the database');
	/* process.exit(1); */ // this prevents JEST from running tests
};
