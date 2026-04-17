-- Run this in your Supabase SQL editor (Database > SQL Editor > New query)

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  buyin_amount integer not null default 100,
  created_at timestamptz default now()
);

create table results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  buyin integer not null,
  cashout integer not null,
  rebuys integer not null default 0,
  created_at timestamptz default now()
);

-- Allow public access (no login needed - anyone with the link can use the app)
alter table players enable row level security;
alter table sessions enable row level security;
alter table results enable row level security;

create policy "Public access" on players for all using (true) with check (true);
create policy "Public access" on sessions for all using (true) with check (true);
create policy "Public access" on results for all using (true) with check (true);
