-- ==========================================
-- SUPABASE DATABASE SETUP FOR SAAS CATALOG
-- Copy and paste this script into your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==========================================

-- 1. Create tenants table
create table if not exists public.tenants (
  id uuid references auth.users on delete cascade primary key,
  business_name text not null,
  plan text not null default 'pro' check (plan in ('pro', 'premium')),
  brand_colors jsonb default '{"primary": "#1E3A8A", "secondary": "#10B981"}'::jsonb,
  logo_url text,
  whatsapp_phone text,
  setup_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for tenants
alter table public.tenants enable row level security;

-- Policy: Users can view and update their own tenant profile
drop policy if exists "Users can view own tenant profile" on public.tenants;
create policy "Users can view own tenant profile" on public.tenants
  for select using (auth.uid() = id);

drop policy if exists "Users can update own tenant profile" on public.tenants;
create policy "Users can update own tenant profile" on public.tenants
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own tenant profile" on public.tenants;
create policy "Users can insert own tenant profile" on public.tenants
  for insert with check (auth.uid() = id);


-- 2. Create products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  price numeric(10,2) not null,
  description text,
  image_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for products
alter table public.products enable row level security;

-- Policy: Tenants can manage their own products
drop policy if exists "Tenants can view own products" on public.products;
create policy "Tenants can view own products" on public.products
  for select using (auth.uid() = tenant_id);

drop policy if exists "Tenants can insert own products" on public.products;
create policy "Tenants can insert own products" on public.products
  for insert with check (auth.uid() = tenant_id);

drop policy if exists "Tenants can update own products" on public.products;
create policy "Tenants can update own products" on public.products
  for update using (auth.uid() = tenant_id);

drop policy if exists "Tenants can delete own products" on public.products;
create policy "Tenants can delete own products" on public.products
  for delete using (auth.uid() = tenant_id);


-- 3. Create catalogs table
create table if not exists public.catalogs (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  name text not null,
  layout_config jsonb default '{}'::jsonb, -- Store color selections, fonts, layouts chosen
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for catalogs
alter table public.catalogs enable row level security;

-- Policy: Tenants can manage their own catalogs
drop policy if exists "Tenants can view own catalogs" on public.catalogs;
create policy "Tenants can view own catalogs" on public.catalogs
  for select using (auth.uid() = tenant_id);

drop policy if exists "Tenants can insert own catalogs" on public.catalogs;
create policy "Tenants can insert own catalogs" on public.catalogs
  for insert with check (auth.uid() = tenant_id);

drop policy if exists "Tenants can update own catalogs" on public.catalogs;
create policy "Tenants can update own catalogs" on public.catalogs
  for update using (auth.uid() = tenant_id);

drop policy if exists "Tenants can delete own catalogs" on public.catalogs;
create policy "Tenants can delete own catalogs" on public.catalogs
  for delete using (auth.uid() = tenant_id);


-- 4. Create catalog_items table (normalized catalog items link)
create table if not exists public.catalog_items (
  id uuid default gen_random_uuid() primary key,
  catalog_id uuid references public.catalogs(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  position integer not null default 0,
  page_number integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for catalog_items
alter table public.catalog_items enable row level security;

-- Policy: Tenants can manage their own catalog items
drop policy if exists "Tenants can view own catalog items" on public.catalog_items;
create policy "Tenants can view own catalog items" on public.catalog_items
  for select using (
    exists (
      select 1 from public.catalogs
      where catalogs.id = catalog_items.catalog_id
      and catalogs.tenant_id = auth.uid()
    )
  );

drop policy if exists "Tenants can insert own catalog items" on public.catalog_items;
create policy "Tenants can insert own catalog items" on public.catalog_items
  for insert with check (
    exists (
      select 1 from public.catalogs
      where catalogs.id = catalog_items.catalog_id
      and catalogs.tenant_id = auth.uid()
    )
  );

drop policy if exists "Tenants can update own catalog items" on public.catalog_items;
create policy "Tenants can update own catalog items" on public.catalog_items
  for update using (
    exists (
      select 1 from public.catalogs
      where catalogs.id = catalog_items.catalog_id
      and catalogs.tenant_id = auth.uid()
    )
  );

drop policy if exists "Tenants can delete own catalog items" on public.catalog_items;
create policy "Tenants can delete own catalog items" on public.catalog_items
  for delete using (
    exists (
      select 1 from public.catalogs
      where catalogs.id = catalog_items.catalog_id
      and catalogs.tenant_id = auth.uid()
    )
  );


-- 5. Create flipbook_publications table
create table if not exists public.flipbook_publications (
  id uuid default gen_random_uuid() primary key,
  catalog_id uuid references public.catalogs(id) on delete cascade not null,
  slug text unique not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for flipbook_publications
alter table public.flipbook_publications enable row level security;

-- Policy: Tenants can manage their own flipbooks
drop policy if exists "Tenants can manage own flipbooks" on public.flipbook_publications;
create policy "Tenants can manage own flipbooks" on public.flipbook_publications
  for all using (
    exists (
      select 1 from public.catalogs
      where catalogs.id = flipbook_publications.catalog_id
      and catalogs.tenant_id = auth.uid()
    )
  );

-- Policy: Public can view active flipbooks
drop policy if exists "Public can view active flipbooks" on public.flipbook_publications;
create policy "Public can view active flipbooks" on public.flipbook_publications
  for select using (is_active = true);


-- 6. Trigger to automatically create a tenant profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.tenants (id, business_name, plan)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'business_name', 'La Mia Attività'), 
    'pro'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 7. Create analytics_events table
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  catalog_id uuid references public.catalogs(id) on delete cascade,
  event_type text not null check (event_type in ('view_catalog', 'click_product', 'click_whatsapp')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for analytics_events
alter table public.analytics_events enable row level security;

-- Policy: Tenants can view their own analytics events
drop policy if exists "Tenants can view own analytics" on public.analytics_events;
create policy "Tenants can view own analytics" on public.analytics_events
  for select using (auth.uid() = tenant_id);

-- Policy: Public can insert analytics events (to track customer views/clicks)
drop policy if exists "Public can insert analytics" on public.analytics_events;
create policy "Public can insert analytics" on public.analytics_events
  for insert with check (true);

