export type SubscriptionInput = {
  deviceToken: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
};

export type ScheduledPush = {
  id: string;
  clientTimerId: string;
  deviceToken: string;
  scentId: string;
  dueAt: string;
  attempts: number;
  subscription: SubscriptionInput['subscription'];
};

export type PushRepository = {
  upsertSubscription(input: SubscriptionInput): Promise<void>;
  upsertSchedule(input: { clientTimerId: string; deviceToken: string; scentId: string; dueAt: string }): Promise<void>;
  cancelSchedule(clientTimerId: string, deviceToken: string): Promise<void>;
  claimDue(limit: number): Promise<ScheduledPush[]>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, attempts: number, error: string): Promise<void>;
  disableSubscription(deviceToken: string): Promise<void>;
  publishUpdate(input: { id: string; version: string; publishedAt: string; title: string; summary: string; details: string[] }): Promise<boolean>;
  listActiveSubscriptions(): Promise<Array<{ deviceToken: string; subscription: SubscriptionInput['subscription'] }>>;
};

export const subscribeDevice = async (input: SubscriptionInput, repository: PushRepository) => {
  if (!input.deviceToken || !input.subscription?.endpoint.startsWith('https://') || !input.subscription.keys?.p256dh || !input.subscription.keys?.auth) {
    throw new Error('invalid-subscription');
  }
  await repository.upsertSubscription(input);
};

export const schedulePush = async (
  input: { clientTimerId: string; deviceToken: string; scentId: string; dueAt: string },
  repository: PushRepository,
) => {
  if (!input.clientTimerId || !input.deviceToken || !input.scentId || !Number.isFinite(new Date(input.dueAt).getTime())) {
    throw new Error('invalid-schedule');
  }
  await repository.upsertSchedule(input);
};

export type PushSender = (subscription: SubscriptionInput['subscription'], payload: string) => Promise<void>;

export const dispatchDuePushes = async (repository: PushRepository, sender: PushSender) => {
  const claimed = await repository.claimDue(100);
  for (const push of claimed) {
    let lastError: unknown;
    let sent = false;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await sender(push.subscription, JSON.stringify({
          title: '这支音乐已经结束',
          body: '如果愿意，可以记下此刻的心情。',
          tag: `xiaoyu-timer-${push.clientTimerId}`,
          url: `/?preview=timer-ended&scent=${encodeURIComponent(push.scentId)}`,
        }));
        await repository.markSent(push.id);
        sent = true;
        break;
      } catch (error) {
        lastError = error;
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await repository.disableSubscription(push.deviceToken);
          break;
        }
      }
    }
    if (!sent) {
      await repository.markFailed(push.id, push.attempts + 1, lastError instanceof Error ? lastError.message : 'push-failed');
    }
  }
  return { claimed: claimed.length };
};

export const publishUpdate = async (
  input: { id: string; version: string; publishedAt: string; title: string; summary: string; details: string[] },
  repository: PushRepository,
  sender?: PushSender,
) => {
  if (!input.id || !input.version || !input.publishedAt || !input.title || !input.summary || !Array.isArray(input.details)) {
    throw new Error('invalid-update');
  }
  const created = await repository.publishUpdate(input);
  if (!created || !sender) return { created };
  const subscriptions = await repository.listActiveSubscriptions();
  const payload = JSON.stringify({
    title: input.title,
    body: input.summary,
    tag: `xiaoyu-update-${input.id}`,
    url: '/?open=updates',
  });
  for (const item of subscriptions) {
    try {
      await sender(item.subscription, payload);
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) await repository.disableSubscription(item.deviceToken);
    }
  }
  return { created };
};
