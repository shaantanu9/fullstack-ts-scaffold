import { beforeAll, afterAll, afterEach } from 'vitest';
import { connectDatabase, disconnectDatabase } from '../src/database';
import { UserModel } from '../src/database/mongoose/models/user.model';
import { redis } from '../src/database/redis';
import { closeEmailQueue } from '../src/jobs/emailQueue';

beforeAll(async () => {
  await connectDatabase();
  await redis.ping();
});

afterEach(async () => {
  await UserModel.deleteMany({});
  await redis.flushdb();
});

afterAll(async () => {
  await closeEmailQueue();
  await disconnectDatabase();
  await redis.quit();
});
