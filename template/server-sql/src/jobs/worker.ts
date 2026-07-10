import IORedis from 'ioredis';
import { Worker } from 'bullmq';
import { appConfig } from '../config/app.config';
import logger from '../utils/logger';
import { EMAIL_QUEUE, processWelcomeEmail } from './emailQueue';

// Standalone worker process — run with `pnpm --filter server-sql worker`.
// Consumes jobs the API enqueues (e.g. welcome emails on registration) so the
// work happens off the request/response path.
const connection = new IORedis(appConfig.redis.url, { maxRetriesPerRequest: null });

const worker = new Worker(EMAIL_QUEUE, processWelcomeEmail, {
  connection,
  concurrency: 5,
});

worker.on('completed', (job) => logger.info('Job completed', { id: job.id, name: job.name }));
worker.on('failed', (job, err) => logger.error('Job failed', { id: job?.id, error: err.message }));

logger.info('Email worker started', { queue: EMAIL_QUEUE });

const shutdown = async (): Promise<void> => {
  await worker.close();
  await connection.quit();
  process.exit(0);
};

process.on('SIGTERM', () => {
  void shutdown();
});
process.on('SIGINT', () => {
  void shutdown();
});
