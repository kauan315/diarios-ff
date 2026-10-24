-- Zyron: IDs públicos de 9 dígitos para todos os perfis.
-- Execute no SQL Editor do Supabase do projeto conectado ao app.

alter table public.profiles
  add column if not exists public_id bigint;

create unique index if not exists profiles_public_id_unique
  on public.profiles (public_id)
  where public_id is not null;

create or replace function public.generate_profile_public_id()
returns trigger
language plpgsql
as $$
declare
  candidate bigint;
begin
  if new.public_id is null then
    loop
      candidate := floor(100000000 + random() * 900000000)::bigint;
      exit when not exists (
        select 1 from public.profiles p where p.public_id = candidate
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

-- Gera IDs para contas que já existiam antes desta alteração.
do $$
declare
  profile_row record;
  candidate bigint;
begin
  for profile_row in
    select id from public.profiles where public_id is null
  loop
    loop
      candidate := floor(100000000 + random() * 900000000)::bigint;
      exit when not exists (
        select 1 from public.profiles p where p.public_id = candidate
      );
    end loop;

    update public.profiles
      set public_id = candidate
      where id = profile_row.id and public_id is null;
  end loop;
end;
$$;
