-- Diários FF: autenticação por e-mail, ID público numérico e conversas individuais.
-- Execute este arquivo no SQL Editor do projeto Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_id bigint not null unique,
  nickname text not null default 'Jogador',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Generate collision-checked 9-digit public IDs for new profiles and
-- normalize old sequence-generated 10-digit IDs when they are updated.
create or replace function public.generate_profile_public_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $
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
$;

drop trigger if exists profiles_generate_public_id on public.profiles;
create trigger profiles_generate_public_id
before insert or update of public_id on public.profiles
for each row execute function public.generate_profile_public_id();

create table if not exists public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint different_direct_users check (user_a <> user_b),
  constraint ordered_direct_pair check (user_a < user_b),
  constraint unique_direct_pair unique (user_a, user_b)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists direct_messages_conversation_created_idx
  on public.direct_messages(conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.direct_conversations enable row level security;
alter table public.direct_messages enable row level security;

drop policy if exists "Profiles are searchable by authenticated users" on public.profiles;
create policy "Profiles are searchable by authenticated users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Participants can view direct conversations" on public.direct_conversations;
create policy "Participants can view direct conversations"
  on public.direct_conversations for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Participants can create direct conversations" on public.direct_conversations;
create policy "Participants can create direct conversations"
  on public.direct_conversations for insert to authenticated
  with check (
    (auth.uid() = user_a or auth.uid() = user_b)
    and user_a < user_b
  );

drop policy if exists "Participants can read direct messages" on public.direct_messages;
create policy "Participants can read direct messages"
  on public.direct_messages for select to authenticated
  using (exists (
    select 1 from public.direct_conversations c
    where c.id = conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ));

drop policy if exists "Participants can send direct messages" on public.direct_messages;
create policy "Participants can send direct messages"
  on public.direct_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.direct_conversations c
      where c.id = conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create or replace function public.dff_create_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), split_part(new.email, '@', 1), 'Jogador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists dff_auth_user_created on auth.users;
create trigger dff_auth_user_created
after insert on auth.users
for each row execute procedure public.dff_create_profile();

-- Realtime para mensagens individuais; seguro executar o schema mais de uma vez.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'direct_messages') then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end $$;
