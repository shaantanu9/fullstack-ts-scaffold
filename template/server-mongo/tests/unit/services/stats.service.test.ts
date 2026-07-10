import { describe, it, expect } from 'vitest';
import * as statsService from '../../../src/services/stats.service';
import * as authService from '../../../src/services/auth.service';
import { userRepository } from '../../../src/database/repositories';

describe('stats.service', () => {
  const register = (email: string) =>
    authService.register({ email, password: 'SecureP@ssw0rd1', name: 'Stat User' });

  it('should aggregate totals, active/inactive, role buckets and recent signups', async () => {
    const a = await register('stat-1@example.com');
    await register('stat-2@example.com');
    const c = await register('stat-3@example.com');

    await userRepository.update(a.user.id, { role: 'ADMIN' });
    await userRepository.update(c.user.id, { isActive: false });

    const stats = await statsService.getUserStats();

    expect(stats.total).toBe(3);
    expect(stats.active).toBe(2);
    expect(stats.inactive).toBe(1);
    expect(stats.byRole.USER).toBe(2);
    expect(stats.byRole.ADMIN).toBe(1);
    expect(stats.byRole.MODERATOR).toBe(0);
    expect(stats.recentSignups).toBe(3);
  });

  it('should return zeroed stats when there are no users', async () => {
    const stats = await statsService.getUserStats();

    expect(stats.total).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.inactive).toBe(0);
    expect(stats.byRole).toEqual({ USER: 0, ADMIN: 0, MODERATOR: 0 });
    expect(stats.recentSignups).toBe(0);
  });
});
