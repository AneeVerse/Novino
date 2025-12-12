-- Add name column to profiles table (replaces username conceptually, but keep username for now for compatibility)
alter table public.profiles
  add column if not exists name text;

-- Add phone column if it doesn't exist
alter table public.profiles
  add column if not exists phone text unique;

-- Create index on phone
create index if not exists profiles_phone_idx on public.profiles (phone);

-- Backfill name from username or full_name for existing users
update public.profiles
set name = coalesce(full_name, username)
where name is null;

-- Update the auth trigger to use 'name' from metadata instead of 'username'
create or replace function public.handle_auth_user_created() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, username, full_name, avatar_url, phone, metadata)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    phone = excluded.phone,
    metadata = excluded.metadata,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

-- Note: We're keeping the 'username' column for backward compatibility
-- but the application now primarily uses 'name' which allows duplicates
-- The unique constraint remains only on username, not on name

