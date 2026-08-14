import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ops_center';
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('[DB] Connected successfully to MongoDB:', mongoUri);
  } catch (error) {
    console.warn('[DB WARNING] Could not connect to local MongoDB. Operating in hybrid/in-memory mode for development resilience.');
  }
};
