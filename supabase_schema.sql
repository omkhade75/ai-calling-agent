-- Run this SQL in your Supabase SQL Editor to create all required tables.

-- 1. Voice Assistants Table
create table if not exists public.voice_assistants (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references auth.users (id) on delete cascade,
    name text not null default 'New Assistant',
    description text,
    system_prompt text default 'You are a friendly voice assistant. Keep responses short and helpful.',
    language text default 'en',
    conversation_mode text default 'friendly',
    temperature numeric(3, 2) default 0.7,
    voice_provider text default 'elevenlabs',
    voice_id text default 'JBFqnCBsd6RMkjVDRZzb',
    voice_speed numeric(3, 2) default 1.0,
    tools jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Row Level Security
alter table public.voice_assistants enable row level security;

-- Allow users to CRUD only their own assistants
create policy "Users can view own assistants" on public.voice_assistants for
select using (auth.uid () = user_id);

create policy "Users can insert own assistants" on public.voice_assistants for
insert
with
    check (auth.uid () = user_id);

create policy "Users can update own assistants" on public.voice_assistants for
update using (auth.uid () = user_id);

create policy "Users can delete own assistants" on public.voice_assistants for delete using (auth.uid () = user_id);

-- 3. User Profiles Table (extends Supabase auth.users)
create table if not exists public.user_profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    display_name text,
    public_key text unique,
    secret_key text unique,
    created_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile" on public.user_profiles for
select using (auth.uid () = id);

create policy "Users can insert own profile" on public.user_profiles for
insert
with
    check (auth.uid () = id);

create policy "Users can update own profile" on public.user_profiles for
update using (auth.uid () = id);

-- 4. Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name, public_key, secret_key)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'displayName', split_part(new.email, '@', 1)),
    'pk_' || replace(gen_random_uuid()::text, '-', ''),
    'sk_' || replace(gen_random_uuid()::text, '-', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Updated_at auto-trigger for assistants
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.voice_assistants;

create trigger set_updated_at
  before update on public.voice_assistants
  for each row execute procedure public.update_updated_at();