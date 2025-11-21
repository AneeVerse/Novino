-- Create addresses table for Supabase
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  line1 text not null,
  line2 text default '',
  city text not null,
  state text not null,
  pincode text not null,
  phone text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Index for faster user lookups
create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists addresses_is_default_idx on public.addresses(user_id, is_default);

-- Enable RLS
alter table public.addresses enable row level security;

-- Auto-update updated_at
create or replace function public.handle_address_updated() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_address_updated on public.addresses;
create trigger on_address_updated
before update on public.addresses
for each row
execute procedure public.handle_address_updated();

-- Ensure only one default address per user
create or replace function public.ensure_single_default_address() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_default = true then
    -- Remove default flag from other addresses of this user
    update public.addresses
    set is_default = false
    where user_id = new.user_id and id != new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_address_default_change on public.addresses;
create trigger on_address_default_change
before insert or update on public.addresses
for each row
execute procedure public.ensure_single_default_address();

-- RLS Policies
drop policy if exists "Users can read own addresses" on public.addresses;
create policy "Users can read own addresses"
  on public.addresses
  for select
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can insert own addresses" on public.addresses;
create policy "Users can insert own addresses"
  on public.addresses
  for insert
  with check (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses"
  on public.addresses
  for update
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses"
  on public.addresses
  for delete
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Service role full access addresses" on public.addresses;
create policy "Service role full access addresses"
  on public.addresses
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');
