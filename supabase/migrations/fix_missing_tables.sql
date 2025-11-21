-- Enable UUID extension
create extension if not exists "uuid-ossp";

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

-- Create shipments table for Supabase
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  shiprocket_order_id text,
  shiprocket_shipment_id text,
  tracking_id text,
  courier_name text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled')),
  expected_delivery_date timestamptz,
  tracking_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes
create index if not exists shipments_order_id_idx on public.shipments(order_id);
create index if not exists shipments_shiprocket_order_id_idx on public.shipments(shiprocket_order_id);
create index if not exists shipments_tracking_id_idx on public.shipments(tracking_id);

-- Enable RLS
alter table public.shipments enable row level security;

-- Auto-update updated_at
create or replace function public.handle_shipment_updated() returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_shipment_updated on public.shipments;
create trigger on_shipment_updated
before update on public.shipments
for each row
execute procedure public.handle_shipment_updated();

-- RLS Policies
drop policy if exists "Service role full access shipments" on public.shipments;
create policy "Service role full access shipments"
  on public.shipments
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');

-- Users can read shipments for their orders
drop policy if exists "Users can read own shipments" on public.shipments;
create policy "Users can read own shipments"
  on public.shipments
  for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = shipments.order_id
      and orders.user_id = auth.uid()
    )
  );
