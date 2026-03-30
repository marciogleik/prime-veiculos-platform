-- Marcas
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz default now()
);

-- Vendedores (profiles vinculados ao auth.users)
create table sellers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  avatar_url text,
  is_active boolean default true,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Veículos
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id),
  model text not null,
  year_fab integer not null,
  year_model integer not null,
  version text,
  price numeric(12,2) not null,
  mileage integer not null,
  color text,
  transmission text check (transmission in ('Manual','Automático','CVT')),
  fuel text check (fuel in ('Flex','Gasolina','Elétrico','Diesel')),
  doors integer,
  description text,
  optionals text[],
  status text default 'disponível' check (status in ('disponível','reservado','vendido')),
  is_featured boolean default false,
  accepts_proposal boolean default false,
  seller_id uuid references sellers(id),
  slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fotos dos veículos
create table vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  url text not null,
  storage_path text not null,
  order_index integer default 0,
  created_at timestamptz default now()
);

-- Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id),
  seller_id uuid references sellers(id),
  customer_name text not null,
  customer_whatsapp text not null,
  status text default 'novo' check (status in ('novo','contatado','negociando','convertido','perdido')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table vehicles enable row level security;
alter table vehicle_photos enable row level security;
alter table leads enable row level security;
alter table sellers enable row level security;
alter table brands enable row level security;

create policy "Veículos públicos visíveis" on vehicles
  for select using (status in ('disponível', 'reservado'));

create policy "Vendedores gerenciam veículos" on vehicles
  for all using (auth.role() = 'authenticated');

create policy "Fotos públicas" on vehicle_photos
  for select using (true);

create policy "Upload autenticado" on vehicle_photos
  for insert with check (auth.role() = 'authenticated');

create policy "Qualquer um pode criar lead" on leads
  for insert with check (true);

create policy "Vendedor lê seus leads" on leads
  for select using (
    auth.uid() = seller_id or
    exists (select 1 from sellers where id = auth.uid() and is_admin = true)
  );

create policy "Sellers autenticados" on sellers
  for all using (auth.role() = 'authenticated');
