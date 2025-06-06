import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.DB_URL || 'mongodb://localhost:27017/health-declaration';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'health-declaration',
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};