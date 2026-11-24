-- Cifra: perfiles, ejercicios vistos, sesiones, intentos, récords y progreso.

create table if not exists profiles (
  user_id text primary key,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  anchor_date text not null,
  diagnostic_done boolean not null default false,
  level int not null default 1,
  season_number int not null default 1,
  season_seen int not null default 0,
  adaptive jsonb not null default '{}'::jsonb,
  sound_on boolean not null default false,
  theme text not null default 'paper'
);

create table if not exists seen_exercises (
  user_id text not null,
  signature text not null,
  kind text not null,
  level int not null,
  mode text not null,
  payload jsonb not null,
  presented_at timestamptz not null default now(),
  primary key (user_id, signature)
);

create index if not exists seen_user_kind_idx on seen_exercises (user_id, kind);

create table if not exists sessions (
  id text primary key,
  user_id text not null,
  mode text not null,
  local_date text not null,
  status text not null,
  started_at timestamptz not null default now(),
  duration_ms int,
  finished_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  attempted int not null default 0,
  correct int not null default 0,
  incorrect int not null default 0,
  abandoned int not null default 0,
  sum_response_ms bigint not null default 0,
  sum_correct_ms bigint not null default 0,
  current_signature text,
  current_payload jsonb,
  current_presented_at timestamptz,
  season_number int not null default 1,
  counts_for_streak boolean not null default false,
  time_accounted boolean not null default false,
  result jsonb
);

create index if not exists sessions_user_idx on sessions (user_id, started_at desc);
create index if not exists sessions_user_mode_idx on sessions (user_id, mode, status);

create table if not exists attempts (
  id bigserial primary key,
  user_id text not null,
  session_id text not null,
  client_token text not null,
  signature text not null,
  kind text not null,
  level int not null,
  mode text not null,
  family text not null default '',
  correct boolean not null,
  skipped boolean not null default false,
  given text not null,
  expected_text text not null,
  response_ms int not null,
  answered_at timestamptz not null default now(),
  unique (user_id, client_token)
);

create index if not exists attempts_user_idx on attempts (user_id, answered_at desc);
create index if not exists attempts_session_idx on attempts (session_id);

create table if not exists records (
  user_id text not null,
  record_key text not null,
  value double precision not null,
  meta jsonb not null default '{}'::jsonb,
  achieved_at timestamptz not null default now(),
  session_id text,
  primary key (user_id, record_key)
);

create table if not exists day_stats (
  user_id text not null,
  local_date text not null,
  daily_completed boolean not null default false,
  free_practiced boolean not null default false,
  clock_practiced boolean not null default false,
  lab_practiced boolean not null default false,
  attempted int not null default 0,
  correct int not null default 0,
  practice_ms bigint not null default 0,
  best_daily_correct int not null default 0,
  primary key (user_id, local_date)
);

create table if not exists diagnostics (
  id bigserial primary key,
  user_id text not null,
  is_baseline boolean not null,
  taken_at timestamptz not null default now(),
  report jsonb not null
);

create unique index if not exists diagnostics_one_baseline
  on diagnostics (user_id) where is_baseline;

create table if not exists season_archive (
  user_id text not null,
  season_number int not null,
  started_on text,
  ended_on text,
  summary jsonb not null,
  primary key (user_id, season_number)
);

create table if not exists lab_progress (
  user_id text not null,
  lesson_id text not null,
  practice_correct int not null default 0,
  practice_attempted int not null default 0,
  quiz_score int,
  quiz_total int,
  mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
