import { app } from './app';
import { connectDB } from './src/database/connection';
import { logger } from './src/utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
	await connectDB();
	logger.info(`Running on http://localhost:${PORT}`);
});
