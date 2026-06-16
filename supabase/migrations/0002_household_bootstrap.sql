-- Lets a first-time user either create a new household (and get an invite
-- code to share) or join an existing one by entering that code.
-- security definer because a brand-new user has no household_member row yet,
-- so plain RLS would block the very insert that grants them access.

alter table household add column invite_code text unique not null default substr(md5(random()::text), 1, 6);

create or replace function create_household(household_name text)
returns household
language plpgsql
security definer
as $$
declare
  new_household household;
begin
  insert into household (name) values (household_name) returning * into new_household;
  insert into household_member (household_id, user_id) values (new_household.id, auth.uid());
  return new_household;
end;
$$;

create or replace function join_household(code text)
returns household
language plpgsql
security definer
as $$
declare
  target household;
begin
  select * into target from household where invite_code = code;
  if target.id is null then
    raise exception 'Invalid invite code';
  end if;
  insert into household_member (household_id, user_id) values (target.id, auth.uid())
    on conflict (household_id, user_id) do nothing;
  return target;
end;
$$;
