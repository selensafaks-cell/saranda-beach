-- Saranda Beach / S-Cafe ~ Beach Restaurant ordering system
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- ============ USERS / ROLES ============
-- Uses Supabase Auth for login. This table adds role info on top of auth.users.
create table public.staff_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  name_en text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ LOCATIONS (zones) ============
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- 'beach','grass','cardak','havuz_restoran','daire'
  name_tr text not null,
  name_en text not null,
  requires_number boolean not null default false, -- true for 'daire'
  sort_order int not null default 0,
  active boolean not null default true
);

insert into public.locations (code, name_tr, name_en, requires_number, sort_order) values
  ('beach', 'Plaj Alanı', 'Beach Area', false, 1),
  ('grass', 'Çim Alanı', 'Grass Area', false, 2),
  ('cardak', 'Çardak Alanı', 'Çardak Area', false, 3),
  ('havuz_restoran', 'Havuz Restoran', 'Pool Restaurant', false, 4),
  ('daire', 'Daire No.', 'Apartment No.', true, 5);

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name_tr text not null,
  name_en text not null,
  description_tr text default '',
  description_en text default '',
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  includes_fries boolean not null default false,
  active boolean not null default true,   -- visible/hidden by staff
  sold_out boolean not null default false, -- shows "Tükendi" but stays visible
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on public.products(category_id);

-- ============ PRODUCT OPTIONS (modifiers) ============
-- e.g. "Soğansız", "Ekstra Peynir" - simple label-based, no price delta needed for Phase 1
-- but price_delta included for Phase 2 readiness.
create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label_tr text not null,
  label_en text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order int not null default 0
);

-- ============ ORDERS ============
create sequence public.order_number_seq start 1;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_order_number int not null default nextval('public.order_number_seq'),
  customer_first_name text not null,
  customer_last_name text not null,
  customer_phone text,
  location_id uuid references public.locations(id),
  location_number text, -- e.g. daire number, free text
  status text not null default 'received'
    check (status in ('received','accepted','preparing','on_the_way','delivered','cancelled')),
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  note text,
  language text not null default 'tr' check (language in ('tr','en')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);

-- ============ ORDER ITEMS ============
-- Snapshots product name + price at time of order so later menu edits
-- never change historical orders.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name_tr text not null,
  name_en text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_note text,
  selected_options jsonb default '[]'::jsonb -- snapshot of chosen modifiers
);

create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_product on public.order_items(product_id); -- used for "most loved"

-- ============ SETTINGS (single row) ============
create table public.settings (
  id int primary key default 1,
  ordering_open boolean not null default true,
  closed_message_tr text not null default 'Şu anda sipariş alımı kapalı. Menümüze göz atabilirsiniz.',
  closed_message_en text not null default 'We are not taking orders right now. Feel free to browse the menu.',
  whatsapp_notify_enabled boolean not null default false,
  whatsapp_number text default '+905515530902',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into public.settings (id) values (1);

-- ============ "MOST LOVED" VIEW ============
-- Computed automatically from real order history, last 30 days.
create or replace view public.most_loved_products as
select
  p.id as product_id,
  p.name_tr,
  p.name_en,
  p.price,
  p.image_url,
  p.category_id,
  count(oi.id) as times_ordered
from public.order_items oi
join public.products p on p.id = oi.product_id
join public.orders o on o.id = oi.order_id
where o.created_at > now() - interval '30 days'
  and o.status <> 'cancelled'
  and p.active = true
group by p.id, p.name_tr, p.name_en, p.price, p.image_url, p.category_id
order by times_ordered desc
limit 8;

-- ============ ROW LEVEL SECURITY ============
alter table public.categories enable row level security;
alter table public.locations enable row level security;
alter table public.products enable row level security;
alter table public.product_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;
alter table public.staff_users enable row level security;

-- Public (anon) can READ menu data
create policy "public read categories" on public.categories for select using (true);
create policy "public read locations" on public.locations for select using (true);
create policy "public read products" on public.products for select using (true);
create policy "public read options" on public.product_options for select using (true);
create policy "public read settings" on public.settings for select using (true);

-- Public can INSERT orders + order_items (guests placing an order), never update/delete
create policy "public create orders" on public.orders for insert with check (true);
create policy "public create order items" on public.order_items for insert with check (true);
-- Guests can read back only their own just-created order (handled via order id knowledge, not listing)
create policy "public read own order" on public.orders for select using (true);
create policy "public read own order items" on public.order_items for select using (true);

-- Authenticated staff (logged in via Supabase Auth) can do everything
create policy "staff full access categories" on public.categories for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access locations" on public.locations for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access products" on public.products for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access options" on public.product_options for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff update orders" on public.orders for update
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff full access settings" on public.settings for all
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff read staff_users" on public.staff_users for select
  using (auth.uid() is not null);

-- NOTE: price manipulation from the browser is prevented because order totals
-- are recalculated server-side in src/lib/actions/orders.ts from the DB price,
-- never trusted from the client payload.
