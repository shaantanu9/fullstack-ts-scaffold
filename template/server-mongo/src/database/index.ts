import { ConnectionStates } from 'mongoose';
import mongoose from './mongoose/connection';
import { appConfig } from '../config/app.config';
import logger from '../utils/logger';

export { userRepository } from './repositories';

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === ConnectionStates.disconnected) {
    await mongoose.connect(appConfig.db.url);
  }
  logger.info('MongoDB connected successfully');
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};

// Readiness probe: verifies the database is actually reachable, not just that
// the process is up. Kept DB-agnostic at the call site (see /ready in app.ts).
export const checkDatabaseHealth = async (): Promise<boolean> => {
  const db = mongoose.connection.db;
  if (!db) {
    return false;
  }
  await db.admin().ping();
  return true;
};
