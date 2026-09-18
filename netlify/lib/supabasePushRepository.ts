import { createClient } from '@supabase/supabase-js';
import type { PushRepository, ScheduledPush, SubscriptionInput } from './pushDomain';

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`missing-env:${name}`);
  return value;
};

export const createPushRepository = (): PushRepository => {
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const checked = async (promise: PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await promise;
    if (error) throw new Error(error.message);
  };
  return {
    upsertSubscription: async (input: SubscriptionInput) => checked(supabase.from('push_subscriptions').upsert({
      device_token: input.deviceToken,
      endpoint: input.subscription.endpoint,
      p256dh: input.subscription.keys.p256dh,
      auth: input.subscription.keys.auth,
      enabled: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'device_token' })),
    upsertSchedule: async (input) => checked(supabase.from('scheduled_pushes').upsert({
      client_timer_id: input.clientTimerId,
      device_token: input.deviceToken,
      scent_id: input.scentId,
      due_at: input.dueAt,
      status: 'pending',
      attempts: 0,
      last_error: null,
    }, { onConflict: 'device_token,client_timer_id' })),
    cancelSchedule: async (clientTimerId, deviceToken) => checked(supabase.from('scheduled_pushes').update({ status: 'cancelled' }).eq('client_timer_id', clientTimerId).eq('device_token', deviceToken)),
    claimDue: async (limit) => {
      const { data, error } = await supabase.rpc('claim_due_pushes', { batch_size: limit });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id,
        clientTimerId: row.client_timer_id,
        deviceToken: row.device_token,
        scentId: row.scent_id,
        dueAt: row.due_at,
        attempts: row.attempts,
        subscription: { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
      })) as ScheduledPush[];
    },
    markSent: async (id) => checked(supabase.from('scheduled_pushes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)),
    markFailed: async (id, attempts, error) => checked(supabase.from('scheduled_pushes').update({ status: 'failed', attempts, last_error: error }).eq('id', id)),
    disableSubscription: async (deviceToken) => checked(supabase.from('push_subscriptions').update({ enabled: false }).eq('device_token', deviceToken)),
    publishUpdate: async (input) => {
      const { error } = await supabase.from('published_updates').insert({
        id: input.id, version: input.version, published_at: input.publishedAt, title: input.title, summary: input.summary, details: input.details,
      });
      if (error?.code === '23505') return false;
      if (error) throw new Error(error.message);
      return true;
    },
    listActiveSubscriptions: async () => {
      const { data, error } = await supabase.from('push_subscriptions').select('device_token,endpoint,p256dh,auth').eq('enabled', true);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => ({ deviceToken: row.device_token, subscription: { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } } }));
    },
  };
};
