import type { Handler } from '@netlify/functions';
import webpush from 'web-push';
import { publishUpdate } from '../lib/pushDomain';
import { createPushRepository } from '../lib/supabasePushRepository';
import { assertAdmin, json, parsePost, statusForError } from '../lib/http';

export const handler: Handler = async (event) => {
  try {
    assertAdmin(event);
    webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:hello@xiaoyuhe.com', process.env.VAPID_PUBLIC_KEY ?? '', process.env.VAPID_PRIVATE_KEY ?? '');
    await publishUpdate(parsePost(event), createPushRepository(), (subscription, payload) => webpush.sendNotification(subscription, payload).then(() => undefined));
    return json(200, { ok: true });
  } catch (error) {
    return json(statusForError(error), { error: error instanceof Error ? error.message : 'unknown-error' });
  }
};
