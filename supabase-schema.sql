-- ============================================================================
-- Torrevieja Studio – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ---- Users ----
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  prenom text not null,
  pseudo text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'Rappeur',
  bio text not null default '',
  photo_url text not null default '',
  color text not null default 'hsl(210, 70%, 75%)',
  initials text not null default '',
  created_at timestamptz not null default now()
);

-- ---- Tracks ----
create table if not exists tracks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist_ids uuid[] not null default '{}',
  extra_artists text not null default '',
  prod text not null default '',
  status text not null default 'Idée',
  duration text not null default '',
  progress_pct integer not null default 0,
  notes text not null default '',
  position integer not null default 0,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---- Lyrics ----
create table if not exists lyrics (
  id uuid primary key default uuid_generate_v4(),
  track_id uuid not null references tracks(id) on delete cascade,
  content text not null default '',
  updated_by uuid not null references users(id) on delete cascade,
  updated_at timestamptz not null default now()
);

-- ---- Vocals ----
create table if not exists vocals (
  id uuid primary key default uuid_generate_v4(),
  track_id uuid not null references tracks(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  type text not null default 'test',
  data_url text not null default '',
  duration_sec real not null default 0,
  created_at timestamptz not null default now()
);

-- ---- Folders ----
create table if not exists folders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  parent_id uuid references folders(id) on delete set null,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---- Files ----
create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'other',
  extension text not null default '',
  size_bytes bigint not null default 0,
  author_id uuid not null references users(id) on delete cascade,
  folder_id uuid references folders(id) on delete set null,
  data_url text not null default '',
  created_at timestamptz not null default now()
);

-- ---- Votes ----
create table if not exists votes (
  id uuid primary key default uuid_generate_v4(),
  track_id uuid not null references tracks(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  direction text not null default 'up',
  created_at timestamptz not null default now(),
  unique(track_id, user_id)
);

-- ---- Chat Messages ----
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  channel text not null default 'général',
  author_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---- Activity Log ----
create table if not exists activity (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  action_type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

-- ---- Project Settings (singleton row) ----
create table if not exists project_settings (
  id uuid primary key default uuid_generate_v4(),
  mixtape_name text not null default 'Torrevieja Tape Vol. 1',
  subtitle text not null default 'Depuis le studio',
  target_date text not null default '2026-06-01',
  cover_url text not null default ''
);

-- Insert default project settings
insert into project_settings (mixtape_name, subtitle, target_date, cover_url)
values ('Torrevieja Tape Vol. 1', 'Depuis le studio', '2026-06-01', '')
on conflict do nothing;

-- ============================================================================
-- Row Level Security (RLS) – permissive for anon key (team app)
-- ============================================================================

alter table users enable row level security;
alter table tracks enable row level security;
alter table lyrics enable row level security;
alter table vocals enable row level security;
alter table folders enable row level security;
alter table files enable row level security;
alter table votes enable row level security;
alter table messages enable row level security;
alter table activity enable row level security;
alter table project_settings enable row level security;

-- Allow all operations for authenticated and anon (team-internal app)
create policy "Allow all for users" on users for all using (true) with check (true);
create policy "Allow all for tracks" on tracks for all using (true) with check (true);
create policy "Allow all for lyrics" on lyrics for all using (true) with check (true);
create policy "Allow all for vocals" on vocals for all using (true) with check (true);
create policy "Allow all for folders" on folders for all using (true) with check (true);
create policy "Allow all for files" on files for all using (true) with check (true);
create policy "Allow all for votes" on votes for all using (true) with check (true);
create policy "Allow all for messages" on messages for all using (true) with check (true);
create policy "Allow all for activity" on activity for all using (true) with check (true);
create policy "Allow all for project_settings" on project_settings for all using (true) with check (true);

-- ============================================================================
-- Realtime – enable for tables that need live sync
-- ============================================================================

alter publication supabase_realtime add table tracks;
alter publication supabase_realtime add table lyrics;
alter publication supabase_realtime add table vocals;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table activity;

-- ============================================================================
-- Demo data
-- ============================================================================

insert into users (id, prenom, pseudo, email, password_hash, role, bio, color, initials, created_at)
values
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Rahim', 'Rahim', 'rahim@torrevieja.studio', 'rahim123', 'Rappeur', 'Rappeur depuis le bloc.', 'hsl(210, 70%, 75%)', 'RA', '2025-01-15T10:00:00Z'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Yassine', 'Yassine', 'yassine@torrevieja.studio', 'yassine123', 'Beatmaker', 'Producteur aux mille instrus.', 'hsl(30, 70%, 75%)', 'YA', '2025-01-15T10:05:00Z')
on conflict (email) do nothing;

insert into tracks (id, title, artist_ids, extra_artists, prod, status, duration, progress_pct, notes, position, created_by, created_at)
values
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Soleil de Torrevieja', '{a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d}', '', 'Yassine', 'En cours', '3:24', 60, 'Ambiance summer, flow rapide sur le deuxième couplet.', 0, 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '2025-02-01T14:00:00Z'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Nuit Blanche', '{a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d,b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e}', '', 'Yassine', 'Idée', '', 10, 'Drill sombre, raconter la nuit.', 1, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '2025-02-10T20:30:00Z'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Brise Marine', '{b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e}', 'Feat. Lina', 'Yassine', 'À mixer', '4:02', 85, 'Prêt pour le mix, vérifier le refrain.', 2, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '2025-03-05T09:15:00Z')
on conflict do nothing;
