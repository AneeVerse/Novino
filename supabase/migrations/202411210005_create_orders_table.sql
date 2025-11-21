-- Create orders table for Supabase
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text unique not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  gst numeric(10,2) not null default 0 check (gst >= 0),
  shipping_cost numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total numeric(10,2) not null check (total >= 0),
  
  -- Delivery Address (embedded JSON)
  delivery_address jsonb not null,
  
  -- Payment Info
  payment_method text not null check (payment_method in ('cod', 'card', 'upi', 'wallet', 'netbanking', 'razorpay')),
  payment_status text not null default 'pending' check (payment_status in ('requires_payment', 'pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id text,
  payment_id uuid,
  shipment_id uuid,
  
  -- Order Status
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Extras
  gift_wrap boolean not null default false,
  
  -- Timestamps
  ordered_at timestamptz not null default timezone('utc'::text, now()),
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  
  -- Status Timeline
  status_timeline jsonb default '[]'::jsonb
);

-- Indexes for faster lookups
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_razorpay_order_id_idx on public.orders(razorpay_order_id);
create index if not exists orders_status_idx on public.orders(order_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- Enable RLS
alter table public.orders enable row level security;

-- Auto-update updated_at
create or replace function public.handle_order_updated() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_order_updated on public.orders;
create trigger on_order_updated
before update on public.orders
for each row
execute procedure public.handle_order_updated();

-- Generate order number before insert
create or replace function public.generate_order_number() returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  timestamp_part text;
  random_part text;
begin
  if new.order_number is null or new.order_number = '' then
    timestamp_part := right(extract(epoch from now())::bigint::text, 8);
    random_part := lpad(floor(random() * 10000)::text, 4, '0');
    new.order_number := 'ORD' || timestamp_part || random_part;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_insert on public.orders;
create trigger on_order_insert
before insert on public.orders
for each row
execute procedure public.generate_order_number();

-- RLS Policies
drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders
  for select
  using (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders
  for insert
  with check (auth.uid() = user_id or coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Service role can update orders" on public.orders;
create policy "Service role can update orders"
  on public.orders
  for update
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');

drop policy if exists "Service role full access orders" on public.orders;
create policy "Service role full access orders"
  on public.orders
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');
