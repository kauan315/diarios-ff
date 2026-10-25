-- Zyron: normalize all public profile IDs to 9 digits, including databases
-- where schema.sql previously assigned 10-digit sequence values.
-- Safe to run more than once. Review in Supabase SQL Editor before execution.

create or replace function public.generate_profile_public_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate bigint;
begin
  if new.public_id is null or new.public_id < 100000000 or new.public_id > 999999999 then
    loop
      candidate := floor(100000000 + random() * 900000000)::bigint;
      exit when not exists (
        select 1 from public.profiles p
        where p.public_id = candidate and p.id is distinct from new.id
      );
    end loop;
    new.public_id := candidate;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_generate_public_id on public.profiles;
create trigger profiles_generate_public_id
before insert or update of public_id on public.profiles
for each row
execute function public.generate_profile_public_id();

-- Repair IDs previously generated as 10 digits. The trigger guarantees that
-- each replacement is a unique 9-digit value.
do $$
declare
  profile_row record;
  candidate bigint;
begin
  for profile_row in
    select id from public.profiles
    where public_id is null or public_id < 100000000 or public_id > 999999999
  loop
    loop
      candidate := floor(100000000 + random() * 900000000)::bigint;
      exit when not exists (
        select 1 from public.profiles p
        where p.public_id = candidate and p.id <> profile_row.id
      );
    end loop;

    update public.profiles
      set public_id = candidate
      where id = profile_row.id;
  end loop;
end;
$$;
