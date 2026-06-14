import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('Error: MONGODB_URI environment variable is missing.');
      process.exit(1);
    }
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully to: ${conn.connection.name}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
