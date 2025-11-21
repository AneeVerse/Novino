alter table public.profiles
  add column if not exists email text unique;

-- Backfill email from auth.users
update public.profiles p
set email = au.email
from auth.users au
where p.id = au.id
  and p.email is null;

alter table public.profiles
  alter column email set not null;

create index if not exists profiles_email_idx on public.profiles (lower(email));

-- Ensure auth trigger also stores email going forward
create or replace function public.handle_auth_user_created() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url, metadata)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    metadata = excluded.metadata,
    updated_at = timezone('utc', now());

  return new;
end;
$$;


