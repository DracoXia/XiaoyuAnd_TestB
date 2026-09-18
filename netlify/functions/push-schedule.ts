import type { Handler } from '@netlify/functions';
import { schedulePush } from '../lib/pushDomain';
import { createPushRepository } from '../lib/supabasePushRepository';
import { json, parsePost, statusForError } from '../lib/http';

export const handler: Handler = async (event) => {
  try {
    await schedulePush(parsePost(event), createPushRepository());
    return json(200, { ok: true });
  } catch (error) {
    return json(statusForError(error), { error: error instanceof Error ? error.message : 'unknown-error' });
  }
};
