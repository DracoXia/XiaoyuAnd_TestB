import { describe, expect, it } from 'vitest';
import { getTimerEndedUrl, getUpdateCenterUrl } from './notificationRouting';

describe('notification click routing', () => {
  it('deep-links a timer notification into the mood recorder', () => {
    expect(getTimerEndedUrl('tinghe')).toBe('/?preview=timer-ended&scent=tinghe');
  });

  it('deep-links an update notification into the production update center', () => {
    expect(getUpdateCenterUrl()).toBe('/?open=updates');
  });
});
