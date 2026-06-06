create table if not exists public.kanban_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  color text not null default 'emerald',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kanban_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.kanban_boards(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kanban_tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.kanban_boards(id) on delete cascade,
  column_id uuid not null references public.kanban_columns(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  labels text[] not null default '{}',
  sync_calendar boolean not null default false,
  sync_notes boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kanban_boards enable row level security;
alter table public.kanban_columns enable row level security;
alter table public.kanban_tasks enable row level security;

drop trigger if exists set_kanban_boards_updated_at on public.kanban_boards;
drop trigger if exists set_kanban_columns_updated_at on public.kanban_columns;
drop trigger if exists set_kanban_tasks_updated_at on public.kanban_tasks;

create trigger set_kanban_boards_updated_at
before update on public.kanban_boards
for each row
execute function public.set_updated_at();

create trigger set_kanban_columns_updated_at
before update on public.kanban_columns
for each row
execute function public.set_updated_at();

create trigger set_kanban_tasks_updated_at
before update on public.kanban_tasks
for each row
execute function public.set_updated_at();

create index if not exists kanban_boards_user_created_idx
on public.kanban_boards (user_id, created_at);

create index if not exists kanban_columns_board_position_idx
on public.kanban_columns (board_id, position);

create index if not exists kanban_tasks_board_column_position_idx
on public.kanban_tasks (board_id, column_id, position);
