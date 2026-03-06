-- ================================================
-- MIGRATION: RECURRING TRANSACTIONS
-- ================================================

create table if not exists public.recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  type text check (type in ('income', 'expense')) not null,
  amount decimal(12,2) not null,
  description text,
  interval text check (interval in ('daily', 'weekly', 'monthly', 'yearly')) not null,
  start_date date default current_date not null,
  last_processed_at timestamp with time zone,
  next_date date not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.recurring_transactions enable row level security;

-- Policies
create policy "Users can view own recurring transactions" on public.recurring_transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own recurring transactions" on public.recurring_transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recurring transactions" on public.recurring_transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own recurring transactions" on public.recurring_transactions
  for delete using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger set_recurring_transactions_updated_at
  before update on public.recurring_transactions
  for each row execute procedure public.handle_updated_at();
