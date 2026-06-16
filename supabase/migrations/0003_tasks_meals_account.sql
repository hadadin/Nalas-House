-- Add meal_type (breakfast/lunch/dinner) to meal table
alter table meal add column if not exists meal_type text not null default 'dinner'
  check (meal_type in ('breakfast', 'lunch', 'dinner'));

-- ── task ────────────────────────────────────────────────────
create table if not exists task (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references household(id) on delete cascade,
  title text not null,
  assignee text not null default 'Both',
  task_type text not null default 'household' check (task_type in ('household', 'dog')),
  done boolean not null default false,
  scheduled_day text check (scheduled_day in ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  repeat_schedule text not null default 'none' check (repeat_schedule in ('none', 'daily', 'weekly', 'monthly')),
  notes text,
  created_at timestamptz not null default now()
);

alter table task enable row level security;

create policy "members can manage their tasks" on task
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- ── account_setting ──────────────────────────────────────────
create table if not exists account_setting (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null unique references household(id) on delete cascade,
  user_name text not null default 'Noam',
  partner_name text not null default 'Partner',
  language text not null default 'English' check (language in ('English', 'Hebrew')),
  week_starts_on text not null default 'Sunday' check (week_starts_on in ('Sunday', 'Monday')),
  default_assignee text not null default 'Both',
  menu_reminders boolean not null default true,
  task_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table account_setting enable row level security;

create policy "members can manage their account settings" on account_setting
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));
