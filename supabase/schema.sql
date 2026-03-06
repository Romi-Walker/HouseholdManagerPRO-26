-- ================================================
-- HAUSHALTSMANAGER PRO - DATABASE SCHEMA
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- 1. PROFILES
-- ================================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  currency text default 'EUR' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- 2. CATEGORIES
-- ================================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  icon text default 'LayoutGrid' not null,
  color text default '#6b7280' not null,
  is_default boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies
create policy "Users can view own categories" on public.categories
  for select using (auth.uid() = user_id);

create policy "Users can insert own categories" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own categories" on public.categories
  for update using (auth.uid() = user_id);

create policy "Users can delete own categories" on public.categories
  for delete using (auth.uid() = user_id);

-- ================================================
-- 3. TRANSACTIONS
-- ================================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  type text check (type in ('income', 'expense')) not null,
  amount decimal(12,2) not null,
  description text,
  date date default current_date not null,
  is_recurring boolean default false not null,
  recurring_interval text, -- 'monthly', 'yearly', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on public.transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- 4. BUDGETS
-- ================================================
create extension if not exists btree_gist;

create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade not null,
  amount decimal(12,2) not null,
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint budgets_date_range_valid check (end_date >= start_date),
  constraint budgets_no_overlap exclude using gist (
    user_id with =,
    category_id with =,
    daterange(start_date, end_date, '[]') with &&
  )
);

-- Enable RLS
alter table public.budgets enable row level security;

-- Policies
create policy "Users can view own budgets" on public.budgets
  for select using (auth.uid() = user_id);

create policy "Users can insert own budgets" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own budgets" on public.budgets
  for update using (auth.uid() = user_id);

create policy "Users can delete own budgets" on public.budgets
  for delete using (auth.uid() = user_id);

create trigger set_budgets_updated_at
  before update on public.budgets
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- 5. AUTH TRIGGER
-- ================================================
-- Create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
