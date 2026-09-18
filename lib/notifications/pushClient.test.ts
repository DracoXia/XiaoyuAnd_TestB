import { describe, expect, it, vi } from 'vitest';
import { cancelTimerNotification, scheduleTimerNotification, subscribeForNotifications } from './pushClient';

describe('push client', () => {
  it('creates and uploads a Push subscription after the user opts in', async () => {
    const subscription = { endpoint: 'https://push.example/device', toJSON: () => ({ endpoint: 'https://push.example/device', keys: { p256dh: 'a', auth: 'b' } }) };
    const subscribe = vi.fn().mockResolvedValue(subscription);
    const register = vi.fn().mockResolvedValue({ pushManager: { getSubscription: vi.fn().mockResolvedValue(null), subscribe } });
    const fetcher = vi.fn().mockResolvedValue({ ok: true });

    const result = await subscribeForNotifications({
      serviceWorker: { register },
      fetcher,
      publicKey: 'AQAB',
      deviceToken: 'device-1',
    });

    expect(register).toHaveBeenCalledWith('/sw.js');
    expect(subscribe).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('/api/push/subscribe', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual({ ok: true, deviceToken: 'device-1' });
  });

  it('schedules and cancels the same client timer id across pause and resume', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    await scheduleTimerNotification({ clientTimerId: 'timer-1', deviceToken: 'device-1', dueAt: '2026-09-18T13:00:00.000Z', scentId: 'tinghe' }, fetcher);
    await cancelTimerNotification('timer-1', 'device-1', fetcher);
    await scheduleTimerNotification({ clientTimerId: 'timer-1', deviceToken: 'device-1', dueAt: '2026-09-18T13:05:00.000Z', scentId: 'tinghe' }, fetcher);

    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(['/api/push/schedule', '/api/push/cancel', '/api/push/schedule']);
    expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({ clientTimerId: 'timer-1' });
  });
});
