-- Nala's House — initial schema
-- Phase 0: household + user (auth-linked)
-- Phase 1: preference, menu, meal, ingredient, shopping_item
-- Every table is scoped to a household via RLS so the two users only ever
-- see their own shared data.

create extension if not exists "uuid-ossp";

-- ── household ────────────────────────────────────────────────
create table household (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ── household_member ─────────────────────────────────────────
-- Links a Supabase auth user to a household. Created on first login.
create table household_member (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references household(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- ── preference ───────────────────────────────────────────────
-- One row per household.
create table preference (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null unique references household(id) on delete cascade,
  dietary_rules text[] not null default '{}',
  dislikes text[] not null default '{}',
  cuisines text[] not null default '{}',
  household_size int not null default 2,
  max_cook_time_minutes int,
  notes text,
  updated_at timestamptz not null default now()
);

-- ── menu ─────────────────────────────────────────────────────
create table menu (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references household(id) on delete cascade,
  week_of date not null,
  status text not null default 'draft' check (status in ('draft', 'accepted')),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── meal ─────────────────────────────────────────────────────
create table meal (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid not null references menu(id) on delete cascade,
  name text not null,
  cuisine text,
  cook_time_minutes int,
  steps text[] not null default '{}',
  day_index int not null check (day_index between 0 and 6),
  created_at timestamptz not null default now()
);

-- ── ingredient ───────────────────────────────────────────────
create table ingredient (
  id uuid primary key default uuid_generate_v4(),
  meal_id uuid not null references meal(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  aisle text not null default 'other'
);

-- ── shopping_item ────────────────────────────────────────────
-- Consolidated, deduped list derived from a menu's ingredients.
create table shopping_item (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid not null references menu(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  aisle text not null default 'other',
  is_checked boolean not null default false
);

-- ── helper: is the current user a member of this household? ──
create or replace function is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from household_member
    where household_id = target_household_id
      and user_id = auth.uid()
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────
alter table household enable row level security;
alter table household_member enable row level security;
alter table preference enable row level security;
alter table menu enable row level security;
alter table meal enable row level security;
alter table ingredient enable row level security;
alter table shopping_item enable row level security;

create policy "members can read their household" on household
  for select using (is_household_member(id));

create policy "members can read their household_member rows" on household_member
  for select using (is_household_member(household_id));

create policy "members can manage their preferences" on preference
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "members can manage their menus" on menu
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "members can manage meals on their menus" on meal
  for all using (
    exists (select 1 from menu where menu.id = meal.menu_id and is_household_member(menu.household_id))
  )
  with check (
    exists (select 1 from menu where menu.id = meal.menu_id and is_household_member(menu.household_id))
  );

create policy "members can manage ingredients on their meals" on ingredient
  for all using (
    exists (
      select 1 from meal join menu on menu.id = meal.menu_id
      where meal.id = ingredient.meal_id and is_household_member(menu.household_id)
    )
  )
  with check (
    exists (
      select 1 from meal join menu on menu.id = meal.menu_id
      where meal.id = ingredient.meal_id and is_household_member(menu.household_id)
    )
  );

create policy "members can manage shopping items on their menus" on shopping_item
  for all using (
    exists (select 1 from menu where menu.id = shopping_item.menu_id and is_household_member(menu.household_id))
  )
  with check (
    exists (select 1 from menu where menu.id = shopping_item.menu_id and is_household_member(menu.household_id))
  );
