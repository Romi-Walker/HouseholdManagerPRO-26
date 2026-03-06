-- ================================================
-- SAVINGS GOALS TABLE
-- Tabelle für persönliche Sparziele
-- ================================================

create table public.savings_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_amount decimal(12,2) not null,
  current_amount decimal(12,2) default 0 not null,
  deadline date,
  color text default '#6366f1' not null,
  icon text default 'PiggyBank' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security aktivieren
alter table public.savings_goals enable row level security;

-- Policies: jeder Nutzer sieht nur seine eigenen Ziele
create policy "Users can view own savings goals" on public.savings_goals
  for select using (auth.uid() = user_id);

create policy "Users can insert own savings goals" on public.savings_goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update own savings goals" on public.savings_goals
  for update using (auth.uid() = user_id);

create policy "Users can delete own savings goals" on public.savings_goals
  for delete using (auth.uid() = user_id);

-- Trigger für updated_at
create trigger set_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute procedure public.handle_updated_at();
