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
