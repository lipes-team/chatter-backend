import express from 'express';
import 'dotenv/config';
import { allRoutes } from './src/routes';
import { requestLogger } from './src/utils/logger';
import { connectDB } from './src/database/connection';

connectDB();

const app = express();

app.use(requestLogger);

app.use(express.json());

app.use('/', allRoutes);

export { app };
