import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeRoutes } from './route.config';
import { connectDB } from './db.config';
import requestLogger from '../middleware/logger.middleware';
import globalErrorHandler from '../middleware/error.middleware';
import notFoundHandler from '../middleware/notFound.middleware';

dotenv.config();

const app = express();
app.use(requestLogger);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

const setupApp = async () => {
  const router = await initializeRoutes();
  await connectDB();
  app.use('/api', router);
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};

export default setupApp;
