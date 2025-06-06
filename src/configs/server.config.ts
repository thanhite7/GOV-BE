import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeRoutes } from './route.config';
import { connectDB } from './db.config';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

const setupApp = async () => {
  const router = await initializeRoutes();
  await connectDB();
  app.use('/api', router);

  return app;
};

export default setupApp;
