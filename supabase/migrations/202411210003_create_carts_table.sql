-- Create carts table for Supabase
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id)
);

-- Index for faster user lookups
create index if not exists carts_user_id_idx on public.carts(user_id);

-- Enable RLS
alter table public.carts enable row level security;

-- Auto-update updated_at
create or replace function public.handle_cart_updated() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_cart_updated on public.carts;
create trigger on_cart_updated
before update on public.carts
for each row
execute procedure public.handle_cart_updated();

-- RLS Policies
drop policy if exists "Users can read own cart" on public.carts;
create policy "Users can read own cart"
  on public.carts
  for select
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can insert own cart" on public.carts;
create policy "Users can insert own cart"
  on public.carts
  for insert
  with check (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can update own cart" on public.carts;
create policy "Users can update own cart"
  on public.carts
  for update
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can delete own cart" on public.carts;
create policy "Users can delete own cart"
  on public.carts
  for delete
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Service role full access carts" on public.carts;
create policy "Service role full access carts"
  on public.carts
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');
