import { describe, expect, it, vi } from 'vitest';
import { dispatchDuePushes, publishUpdate, schedulePush, subscribeDevice, type PushRepository } from './pushDomain';

const repository = (): PushRepository => ({
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  upsertSchedule: vi.fn().mockResolvedValue(undefined),
  cancelSchedule: vi.fn().mockResolvedValue(undefined),
  claimDue: vi.fn().mockResolvedValue([]),
  markSent: vi.fn().mockResolvedValue(undefined),
  markFailed: vi.fn().mockResolvedValue(undefined),
  disableSubscription: vi.fn().mockResolvedValue(undefined),
  publishUpdate: vi.fn().mockResolvedValue(true),
  listActiveSubscriptions: vi.fn().mockResolvedValue([]),
});

describe('push notification domain', () => {
  it('upserts the same device subscription idempotently', async () => {
    const repo = repository();
    const input = { deviceToken: 'device-1', subscription: { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } } };
    await subscribeDevice(input, repo);
    await subscribeDevice(input, repo);
    expect(repo.upsertSubscription).toHaveBeenCalledTimes(2);
    expect(repo.upsertSubscription).toHaveBeenLastCalledWith(input);
  });

  it('rejects a malformed device subscription before repository access', async () => {
    const repo = repository();
    await expect(subscribeDevice({ deviceToken: '', subscription: { endpoint: 'http://unsafe', keys: { p256dh: '', auth: '' } } }, repo)).rejects.toThrow('invalid-subscription');
    expect(repo.upsertSubscription).not.toHaveBeenCalled();
  });

  it('uses device and client timer ids as the stable schedule identity', async () => {
    const repo = repository();
    const first = { clientTimerId: 'timer-1', deviceToken: 'device-1', scentId: 'tinghe', dueAt: '2026-09-18T13:00:00.000Z' };
    await schedulePush(first, repo);
    await schedulePush({ ...first, dueAt: '2026-09-18T13:05:00.000Z' }, repo);
    expect(repo.upsertSchedule).toHaveBeenLastCalledWith({ ...first, dueAt: '2026-09-18T13:05:00.000Z' });
  });

  it('retries a due notification up to three times and marks it sent once', async () => {
    const repo = repository();
    vi.mocked(repo.claimDue).mockResolvedValue([{ id: 'push-1', clientTimerId: 'timer-1', deviceToken: 'device-1', scentId: 'tinghe', dueAt: '2026-09-18T13:00:00.000Z', attempts: 0, subscription: { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } } }]);
    const sender = vi.fn().mockRejectedValueOnce(new Error('network')).mockRejectedValueOnce(new Error('network')).mockResolvedValue(undefined);
    await dispatchDuePushes(repo, sender);
    expect(sender).toHaveBeenCalledTimes(3);
    expect(repo.markSent).toHaveBeenCalledOnce();
    expect(repo.markFailed).not.toHaveBeenCalled();
  });

  it('disables an expired subscription and does not retry it', async () => {
    const repo = repository();
    vi.mocked(repo.claimDue).mockResolvedValue([{ id: 'push-1', clientTimerId: 'timer-1', deviceToken: 'device-1', scentId: 'tinghe', dueAt: '2026-09-18T13:00:00.000Z', attempts: 0, subscription: { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } } }]);
    const error = Object.assign(new Error('expired'), { statusCode: 410 });
    const sender = vi.fn().mockRejectedValue(error);
    await dispatchDuePushes(repo, sender);
    expect(sender).toHaveBeenCalledOnce();
    expect(repo.disableSubscription).toHaveBeenCalledWith('device-1');
  });

  it('does not redispatch a task after the repository has atomically claimed it', async () => {
    const repo = repository();
    const row = { id: 'push-1', clientTimerId: 'timer-1', deviceToken: 'device-1', scentId: 'tinghe', dueAt: '2026-09-18T13:00:00.000Z', attempts: 0, subscription: { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } } };
    vi.mocked(repo.claimDue).mockResolvedValueOnce([row]).mockResolvedValueOnce([]);
    const sender = vi.fn().mockResolvedValue(undefined);
    await dispatchDuePushes(repo, sender);
    await dispatchDuePushes(repo, sender);
    expect(sender).toHaveBeenCalledOnce();
  });

  it('publishes the same update id idempotently', async () => {
    const repo = repository();
    vi.mocked(repo.publishUpdate).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    vi.mocked(repo.listActiveSubscriptions).mockResolvedValue([{ deviceToken: 'device-1', subscription: { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } } }]);
    const sender = vi.fn().mockResolvedValue(undefined);
    const update = { id: 'release-1', version: '2.6.0', publishedAt: '2026-09-18', title: '更新', summary: '摘要', details: ['详情'] };
    await publishUpdate(update, repo, sender);
    await publishUpdate(update, repo, sender);
    expect(repo.publishUpdate).toHaveBeenCalledTimes(2);
    expect(repo.publishUpdate).toHaveBeenLastCalledWith(update);
    expect(sender).toHaveBeenCalledOnce();
  });
});
