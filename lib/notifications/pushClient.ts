export type NotificationOptInResult = 'granted' | 'denied' | 'unsupported';
export const PUSH_DEVICE_TOKEN_KEY = 'xiaoyu_push_device_token_v1';
export const TIMER_NOTIFICATION_ENABLED_KEY = 'xiaoyu_timer_notification_enabled_v1';
export const UPDATE_NOTIFICATION_ENABLED_KEY = 'xiaoyu_update_notification_enabled_v1';

export const getOrCreateDeviceToken = (storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) => {
  const existing = storage.getItem(PUSH_DEVICE_TOKEN_KEY);
  if (existing) return existing;
  const token = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  storage.setItem(PUSH_DEVICE_TOKEN_KEY, token);
  return token;
};

type PushSubscriptionLike = { toJSON(): unknown };
type PushRegistrationLike = {
  pushManager: {
    getSubscription(): Promise<PushSubscriptionLike | null>;
    subscribe(options: { userVisibleOnly: true; applicationServerKey: Uint8Array<ArrayBuffer> }): Promise<PushSubscriptionLike>;
  };
};

type SubscribeDependencies = {
  serviceWorker: { register(path: string): Promise<PushRegistrationLike> };
  fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<{ ok: boolean }>;
  publicKey: string;
  deviceToken: string;
};

export type TimerNotificationRequest = {
  clientTimerId: string;
  deviceToken: string;
  dueAt: string;
  scentId: string;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<{ ok: boolean }>;

const postJson = async (url: string, body: unknown, fetcher: Fetcher) => {
  const response = await fetcher(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`request-failed:${url}`);
};

export const scheduleTimerNotification = async (request: TimerNotificationRequest, fetcher: Fetcher = window.fetch.bind(window)) => {
  await postJson('/api/push/schedule', request, fetcher);
};

export const cancelTimerNotification = async (clientTimerId: string, deviceToken: string, fetcher: Fetcher = window.fetch.bind(window)) => {
  await postJson('/api/push/cancel', { clientTimerId, deviceToken }, fetcher);
};

const urlBase64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};

export const subscribeForNotifications = async ({
  serviceWorker,
  fetcher,
  publicKey,
  deviceToken,
}: SubscribeDependencies) => {
  const registration = await serviceWorker.register('/sw.js');
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  const response = await fetcher('/api/push/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceToken, subscription: subscription.toJSON() }),
  });
  if (!response.ok) throw new Error('push-subscription-failed');
  return { ok: true as const, deviceToken };
};

export const requestNotificationPermission = async (): Promise<NotificationOptInResult> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (window.Notification.permission === 'granted') return 'granted';
  const permission = await window.Notification.requestPermission();
  return permission === 'granted' ? 'granted' : 'denied';
};
