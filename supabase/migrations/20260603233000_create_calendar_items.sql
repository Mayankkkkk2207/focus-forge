create table if not exists public.calendar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  item_type text not null default 'task' check (item_type in ('task', 'reminder')),
  category text not null default 'Focus',
  color text not null default 'cyan',
  scheduled_date date,
  scheduled_time time,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'snoozed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  reminder_email text,
  reminder_lead_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calendar_items enable row level security;

drop trigger if exists set_calendar_items_updated_at on public.calendar_items;

create trigger set_calendar_items_updated_at
before update on public.calendar_items
for each row
execute function public.set_updated_at();

create index if not exists calendar_items_user_scheduled_date_idx
on public.calendar_items (user_id, scheduled_date);

create index if not exists calendar_items_user_drafts_idx
on public.calendar_items (user_id)
where scheduled_date is null;
