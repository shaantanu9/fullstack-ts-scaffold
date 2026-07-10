import mongoose from 'mongoose';
import { appConfig } from '../../config/app.config';

// Guard against creating multiple mongoose instances during dev hot-reload,
// mirroring the global prisma-client singleton pattern in server-sql.
const globalForMongoose = globalThis as unknown as {
  mongoose: typeof mongoose | undefined;
};

mongoose.set('strictQuery', true);

export const mongooseClient = globalForMongoose.mongoose ?? mongoose;

if (appConfig.isDev) {
  globalForMongoose.mongoose = mongooseClient;
}

export const connection = mongooseClient.connection;

export default mongooseClient;
