import type { Handler } from '@netlify/functions';
import { createPushRepository } from '../lib/supabasePushRepository';
import { json, parsePost, statusForError } from '../lib/http';

export const handler: Handler = async (event) => {
  try {
    const { clientTimerId, deviceToken } = parsePost<{ clientTimerId?: string; deviceToken?: string }>(event);
    if (!clientTimerId || !deviceToken) throw new Error('invalid-cancel');
    await createPushRepository().cancelSchedule(clientTimerId, deviceToken);
    return json(200, { ok: true });
  } catch (error) {
    return json(statusForError(error), { error: error instanceof Error ? error.message : 'unknown-error' });
  }
};
