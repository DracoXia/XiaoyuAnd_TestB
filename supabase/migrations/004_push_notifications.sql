-- Push subscriptions and schedules contain device routing only. Mood data never leaves the browser.
create table if not exists public.push_subscriptions (
  device_token text primary key,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scheduled_pushes (
  id uuid primary key default gen_random_uuid(),
  client_timer_id text not null,
  device_token text not null references public.push_subscriptions(device_token) on delete cascade,
  scent_id text not null,
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_token, client_timer_id)
);

create index if not exists scheduled_pushes_due_idx on public.scheduled_pushes (due_at) where status = 'pending';

create table if not exists public.published_updates (
  id text primary key,
  version text not null,
  published_at date not null,
  title text not null,
  summary text not null,
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
alter table public.scheduled_pushes enable row level security;
alter table public.published_updates enable row level security;

-- No client policies are created: these tables are service-role only.

create or replace function public.claim_due_pushes(batch_size integer default 100)
returns table (
  id uuid, client_timer_id text, device_token text, scent_id text, due_at timestamptz,
  attempts integer, endpoint text, p256dh text, auth text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with claimed as (
    select sp.id
    from scheduled_pushes sp
    join push_subscriptions ps on ps.device_token = sp.device_token and ps.enabled
    where sp.status = 'pending' and sp.due_at <= now()
    order by sp.due_at
    limit batch_size
    for update of sp skip locked
  ), updated as (
    update scheduled_pushes sp
    set status = 'processing', updated_at = now()
    from claimed
    where sp.id = claimed.id
    returning sp.*
  )
  select u.id, u.client_timer_id, u.device_token, u.scent_id, u.due_at, u.attempts,
         ps.endpoint, ps.p256dh, ps.auth
  from updated u join push_subscriptions ps on ps.device_token = u.device_token;
end;
$$;

revoke all on function public.claim_due_pushes(integer) from public, anon, authenticated;
grant execute on function public.claim_due_pushes(integer) to service_role;

-- Configure Supabase Cron after setting PUSH_ADMIN_KEY in Vault. One-minute cadence:
-- select cron.schedule('dispatch-pushes', '* * * * *', $$select net.http_post(
--   url := 'https://YOUR_SITE.netlify.app/api/push/dispatch',
--   headers := jsonb_build_object('authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='PUSH_ADMIN_KEY'), 'content-type', 'application/json'),
--   body := '{}'::jsonb
-- );$$);
