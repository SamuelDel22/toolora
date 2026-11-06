-- Toolora Premium: ejecutar en Supabase SQL Editor.
-- No contiene credenciales privadas. El acceso Premium solo lo modifica el backend/webhook.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('mercadopago')),
  provider_subscription_id text not null unique,
  plan_code text not null check (plan_code in ('premium_monthly')),
  status text not null default 'pending' check (status in ('pending','authorized','paused','cancelled','rejected','expired')),
  amount_cop integer not null default 9900 check (amount_cop = 9900),
  currency text not null default 'COP' check (currency = 'COP'),
  payer_email text,
  external_reference text not null,
  next_payment_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_status_idx on public.subscriptions(user_id, status, created_at desc);
alter table public.subscriptions enable row level security;
drop policy if exists "Users can read their own subscriptions" on public.subscriptions;
create policy "Users can read their own subscriptions" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
-- No se crean políticas INSERT/UPDATE/DELETE para clientes. Solo service_role en funciones Cloudflare.

create table if not exists public.premium_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercadopago',
  event_key text not null unique,
  topic text not null,
  provider_object_id text,
  received_at timestamptz not null default now()
);
alter table public.premium_webhook_events enable row level security;
-- Sin políticas para clientes: solo backend con service_role puede leer/escribir.
