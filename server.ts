import { initializeApp } from './app';
import { logger } from './src/utils/logger';

const PORT = process.env.PORT || 3000;

const server = initializeApp()
	.then(({ app }) => {
		app.listen(PORT, () => {
			logger.info(`Running on http://localhost:${PORT}`);
		});
	})
	.catch((error) => {
		logger.error(error);
	});
