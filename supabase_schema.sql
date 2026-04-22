-- Create a table for public profiles (optional, but good practice)
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,
  preferences jsonb default '{}'::jsonb,
  updated_at timestamp with time zone,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- HABITS TABLE
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table habits enable row level security;

create policy "Individuals can create habits."
  on habits for insert
  with check ( auth.uid() = user_id );

create policy "Individuals can view their own habits. "
  on habits for select
  using ( auth.uid() = user_id );

create policy "Individuals can delete their own habits."
  on habits for delete
  using ( auth.uid() = user_id );

-- HABIT COMPLETIONS (Normalized)
create table habit_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references habits on delete cascade not null,
  completed_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, completed_date)
);

alter table habit_completions enable row level security;

create policy "Individuals can mark habits as complete."
  on habit_completions for insert
  with check ( auth.uid() = user_id );

create policy "Individuals can view their completions."
  on habit_completions for select
  using ( auth.uid() = user_id );

create policy "Individuals can delete their completions."
  on habit_completions for delete
  using ( auth.uid() = user_id );

-- ACHIEVEMENTS
create table achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  month text not null, -- Format YYYY-MM
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table achievements enable row level security;

create policy "Users can manage their achievements"
  on achievements for all
  using ( auth.uid() = user_id );

-- TODOS
create table todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  completed boolean default false,
  type text default 'daily',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table todos enable row level security;

create policy "Users can manage their todos"
  on todos for all
  using ( auth.uid() = user_id );

-- JOURNAL
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date text not null, -- Format YYYY-MM-DD
  content text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table journal_entries enable row level security;

create policy "Users can manage their journal"
  on journal_entries for all
  using ( auth.uid() = user_id );

-- METRICS
create table metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date text not null, -- Format YYYY-MM-DD
  value integer not null,
  label text not null, -- e.g. "productivity_score"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table metrics enable row level security;

  on metrics for all
  using ( auth.uid() = user_id );

-- COACH MESSAGES
create table coach_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table coach_messages enable row level security;

create policy "Users can manage their coach messages"
  on coach_messages for all
  using ( auth.uid() = user_id );
