-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  default_volume numeric(3, 2) default 0.70 check (default_volume >= 0 and default_volume <= 1),
  loop_enabled boolean default false,
  theme_preference text default 'dark' check (theme_preference in ('dark', 'light')),
  notifications_enabled boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Create policies
-- Users can view their own preferences
create policy "Users can view own preferences"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

-- Users can insert their own preferences
create policy "Users can insert own preferences"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own preferences
create policy "Users can update own preferences"
  on public.user_preferences
  for update
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for user_preferences
create trigger on_user_preferences_updated
  before update on public.user_preferences
  for each row
  execute function public.handle_updated_at();

