-- Create the public.profiles table synced with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  is_blocked boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

alter table if exists public.profiles enable row level security;

-- Automatically keep updated_at fresh
create or replace function public.handle_profile_updated() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
before update on public.profiles
for each row
execute procedure public.handle_profile_updated();

-- Seed profile row whenever an auth user is created
create or replace function public.handle_auth_user_created() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, metadata)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  on conflict (id) do update set
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    metadata = excluded.metadata,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_auth_user_created();

-- Policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id or coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (auth.uid() = id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Service role full access" on public.profiles;
create policy "Service role full access"
  on public.profiles
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');


