import { describe, it, expect, vi } from 'vitest';
import type { Job } from 'bullmq';
import {
  enqueueWelcomeEmail,
  processWelcomeEmail,
  getEmailQueue,
  type WelcomeEmailData,
} from '../../../src/jobs/emailQueue';
import logger from '../../../src/utils/logger';

describe('emailQueue', () => {
  describe('processWelcomeEmail', () => {
    it('should process a welcome-email job and log it', async () => {
      const spy = vi.spyOn(logger, 'info').mockReturnValue(logger);

      await processWelcomeEmail({
        data: { userId: 'u1', email: 'a@example.com' },
      } as Job<WelcomeEmailData>);

      expect(spy).toHaveBeenCalledWith('Processing welcome email', {
        userId: 'u1',
        email: 'a@example.com',
      });
      spy.mockRestore();
    });
  });

  describe('enqueueWelcomeEmail', () => {
    it('should add a welcome-email job to the queue', async () => {
      await enqueueWelcomeEmail({ userId: 'u2', email: 'b@example.com' });

      const counts = await getEmailQueue().getJobCounts('wait', 'delayed', 'active');
      const total = (counts.wait ?? 0) + (counts.delayed ?? 0) + (counts.active ?? 0);
      expect(total).toBeGreaterThanOrEqual(1);
    });

    it('should swallow-and-log errors so registration never fails', async () => {
      const addSpy = vi.spyOn(getEmailQueue(), 'add').mockRejectedValue(new Error('redis down'));
      const errSpy = vi.spyOn(logger, 'error').mockReturnValue(logger);

      await expect(
        enqueueWelcomeEmail({ userId: 'u3', email: 'c@example.com' }),
      ).resolves.toBeUndefined();
      expect(errSpy).toHaveBeenCalled();

      addSpy.mockRestore();
      errSpy.mockRestore();
    });
  });
});
