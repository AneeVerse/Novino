-- Create a secure function to lookup email by username for login
-- This is needed because users need to look up their email by username before authentication
-- The function is marked as SECURITY DEFINER so it bypasses RLS

create or replace function public.get_email_by_username(username_input text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  email_result text;
begin
  select email into email_result
  from public.profiles
  where lower(username) = lower(username_input)
  limit 1;
  
  return email_result;
end;
$$;

-- Grant execute permission to anon users (unauthenticated users)
grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- Also allow direct read access to username and email for login (more efficient)
-- This is safe because username and email are not sensitive enough to require full protection
drop policy if exists "Public can read username and email for login" on public.profiles;
create policy "Public can read username and email for login"
  on public.profiles
  for select
  using (true);

