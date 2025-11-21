-- Create payments table for Supabase
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  razorpay_order_id text,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created', 'authorized', 'captured', 'refunded', 'failed')),
  method text,
  description text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists payments_razorpay_order_id_idx on public.payments(razorpay_order_id);
create index if not exists payments_razorpay_payment_id_idx on public.payments(razorpay_payment_id);

-- Enable RLS
alter table public.payments enable row level security;

-- Auto-update updated_at
create or replace function public.handle_payment_updated() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_payment_updated on public.payments;
create trigger on_payment_updated
before update on public.payments
for each row
execute procedure public.handle_payment_updated();

-- RLS Policies (Service role only for payment operations)
drop policy if exists "Service role full access payments" on public.payments;
create policy "Service role full access payments"
  on public.payments
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');

-- Users can read payments for their orders
drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments
  for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );
