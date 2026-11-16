-- =====================================================================
-- Jogos Enzola — migração v3 (inclui a v2)
-- Rode UMA vez no Supabase: SQL Editor > New query > cole tudo > Run.
-- É seguro rodar de novo: nada é apagado e nada é duplicado.
-- =====================================================================

-- 1) Campos novos dos jogos -------------------------------------------
alter table public.games
  add column if not exists hours            numeric,      -- horas jogadas
  add column if not exists metacritic       integer,      -- nota do Metacritic (RAWG)
  add column if not exists playtime         integer,      -- duração média em horas (RAWG)
  add column if not exists rawg_id          integer,      -- id do jogo no RAWG
  add column if not exists target_price     numeric,      -- preço-alvo da lista de desejos
  add column if not exists price            jsonb,        -- último preço encontrado (melhor oferta + lojas)
  add column if not exists price_checked_at timestamptz;  -- quando o preço foi conferido

-- 2) Perfil: público, ID de 4 dígitos e configurações ------------------
alter table public.profiles
  add column if not exists is_public boolean not null default false,
  add column if not exists tag       text,
  add column if not exists settings  jsonb not null default '{}'::jsonb;
create unique index if not exists profiles_tag_key on public.profiles(tag);

-- Página pública (#u/usuario). Só devolve algo se o dono marcou "Perfil público".
-- Não expõe lista de desejos, preços nem observações.
create or replace function public.public_profile(uname text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with p as (
    select user_id, username, nickname, bio, avatar, banner, favorites, now_playing, tag
    from public.profiles
    where username = lower(uname) and is_public
    limit 1
  )
  select json_build_object(
    'profile', (select row_to_json(p) from p),
    'games', coalesce((
      select json_agg(g order by g.n)
      from (
        select id, n, name, status, exp, rating, tier, tier_order, cover_url,
               platform, genre, year, review, hours, finished_at
        from public.games
        where user_id = (select user_id from p)
          and status <> 'Não comprado'
          and coalesce(wishlist, false) = false
      ) g
    ), '[]'::json)
  );
$$;
revoke all on function public.public_profile(text) from public;
grant execute on function public.public_profile(text) to anon, authenticated;

-- 3) Cadastro: checa se o usuário já existe (formato antigo e novo de e-mail)
create or replace function public.username_taken(uname text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (select 1 from public.profiles where username = lower(uname))
      or exists (
        select 1 from auth.users
        where lower(split_part(email, '@', 1)) = lower(uname)
           or lower(split_part(split_part(email, '@', 1), '+', 2)) = lower(uname)
      );
$$;
revoke all on function public.username_taken(text) from public;
grant execute on function public.username_taken(text) to anon, authenticated;


-- 4) ID próprio de 4 dígitos (#0427) ----------------------------------
create or replace function public.new_tag()
returns text language plpgsql security definer set search_path = public as $$
declare t text; tries int := 0;
begin
  loop
    t := lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (select 1 from public.profiles where tag = t);
    tries := tries + 1;
    if tries > 100000 then raise exception 'Não há mais IDs livres'; end if;
  end loop;
  return t;
end $$;

create or replace function public.profiles_tag_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.tag is null or new.tag !~ '^\d{4}$' or exists (select 1 from public.profiles where tag = new.tag) then
      new.tag := public.new_tag();
    end if;
  else
    new.tag := coalesce(old.tag, public.new_tag());   -- o ID não pode ser trocado pelo usuário
  end if;
  return new;
end $$;
revoke all on function public.new_tag() from public;
drop trigger if exists profiles_tag_guard on public.profiles;
create trigger profiles_tag_guard before insert or update on public.profiles
  for each row execute function public.profiles_tag_guard();

do $$ declare r record; begin
  for r in select user_id from public.profiles where tag is null loop
    update public.profiles set tag = public.new_tag() where user_id = r.user_id;
  end loop;
end $$;

-- 5) Funções de apoio ---------------------------------------------------
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.friendships
                 where status = 'accepted'
                   and ((requester = a and addressee = b) or (requester = b and addressee = a)));
$$;

-- Respeita as escolhas de privacidade do destinatário (Configurações > Privacidade)
create or replace function public.accepts(uid uuid, what text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select (settings ->> ('allow_' || what))::boolean from public.profiles where user_id = uid), true);
$$;

-- Busca de amigos por usuário, #ID ou usuario#ID
create or replace function public.find_user2(q text)
returns table (user_id uuid, username text, nickname text, avatar text, tag text)
language sql stable security definer set search_path = public as $$
  with s as (select lower(trim(ltrim(trim(q), '@'))) as v)
  select p.user_id, p.username, p.nickname, p.avatar, p.tag
  from public.profiles p, s
  where (s.v ~ '^#?\d{4}$' and p.tag = ltrim(s.v, '#'))
     or (s.v !~ '#' and p.username = s.v)
     or (s.v ~ '^[a-z0-9._-]+#\d{4}$' and p.username = split_part(s.v, '#', 1) and p.tag = split_part(s.v, '#', 2))
  limit 5;
$$;
revoke all on function public.find_user2(text) from public;
grant execute on function public.find_user2(text) to authenticated;

-- 6) Notificações (cutucar, sugestão de jogo, mensagem, pedidos de amizade)
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  actor      uuid references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('poke','suggest','message','friend_request','friend_accept')),
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;

drop policy if exists "notif: ver as minhas" on public.notifications;
create policy "notif: ver as minhas" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "notif: marcar lida" on public.notifications;
create policy "notif: marcar lida" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notif: apagar as minhas" on public.notifications;
create policy "notif: apagar as minhas" on public.notifications for delete to authenticated using (user_id = auth.uid());
drop policy if exists "notif: cutucar ou sugerir amigo" on public.notifications;
create policy "notif: cutucar ou sugerir amigo" on public.notifications for insert to authenticated
  with check (actor = auth.uid() and kind in ('poke','suggest')
              and public.are_friends(auth.uid(), user_id) and public.accepts(user_id, kind));

create or replace function public.notifications_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then           -- só dá para marcar como lida
    new.user_id := old.user_id; new.actor := old.actor; new.kind := old.kind;
    new.payload := old.payload; new.created_at := old.created_at;
    return new;
  end if;
  if new.kind = 'poke' and exists (
       select 1 from public.notifications
       where kind = 'poke' and actor = new.actor and user_id = new.user_id
         and created_at > now() - interval '1 minute') then
    raise exception 'Espere um minuto para cutucar de novo' using errcode = 'P0001';
  end if;
  if new.kind = 'suggest' then
    new.payload := jsonb_build_object(
      'name',      left(coalesce(new.payload->>'name', ''), 200),
      'rawg_id',   case when (new.payload->>'rawg_id') ~ '^\d+$' then (new.payload->>'rawg_id')::int end,
      'cover_url', case when (new.payload->>'cover_url') ~ '^https://' then left(new.payload->>'cover_url', 500) end,
      'note',      left(coalesce(new.payload->>'note', ''), 300));
  else
    new.payload := '{}'::jsonb;
  end if;
  return new;
end $$;
drop trigger if exists notifications_guard on public.notifications;
create trigger notifications_guard before insert or update on public.notifications
  for each row when (pg_trigger_depth() = 0) execute function public.notifications_guard();

-- 7) Mensagens entre amigos ---------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  sender     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient  uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists messages_pair_idx on public.messages (sender, recipient, created_at desc);
create index if not exists messages_unread_idx on public.messages (recipient, read_at);
alter table public.messages enable row level security;

drop policy if exists "msg: ver as minhas" on public.messages;
create policy "msg: ver as minhas" on public.messages for select to authenticated using (sender = auth.uid() or recipient = auth.uid());
drop policy if exists "msg: enviar para amigo" on public.messages;
create policy "msg: enviar para amigo" on public.messages for insert to authenticated
  with check (sender = auth.uid() and public.are_friends(auth.uid(), recipient) and public.accepts(recipient, 'message'));
drop policy if exists "msg: marcar lida" on public.messages;
create policy "msg: marcar lida" on public.messages for update to authenticated using (recipient = auth.uid()) with check (recipient = auth.uid());

create or replace function public.messages_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  new.id := old.id; new.sender := old.sender; new.recipient := old.recipient;
  new.body := old.body; new.created_at := old.created_at;
  return new;
end $$;
drop trigger if exists messages_guard on public.messages;
create trigger messages_guard before update on public.messages for each row execute function public.messages_guard();

-- Avisos automáticos (rodam com permissão do sistema)
create or replace function public.notify_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor, kind) values (new.recipient, new.sender, 'message');
  return new;
end $$;
drop trigger if exists notify_message on public.messages;
create trigger notify_message after insert on public.messages for each row execute function public.notify_message();

create or replace function public.notify_friendship()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    insert into public.notifications (user_id, actor, kind) values (new.addressee, new.requester, 'friend_request');
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.notifications (user_id, actor, kind) values (new.requester, new.addressee, 'friend_accept');
  end if;
  return new;
end $$;
drop trigger if exists notify_friendship on public.friendships;
create trigger notify_friendship after insert or update on public.friendships for each row execute function public.notify_friendship();

-- 8) Código de recuperação de senha ---------------------------------------
-- Guarda só o "hash" do código. Ninguém lê esta tabela pelo site; só a função do servidor.
create table if not exists public.account_recovery (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  code_hash    text,
  failed       int not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);
alter table public.account_recovery enable row level security;

create or replace function public.set_recovery_hash(h text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Faça login primeiro'; end if;
  if h !~ '^[0-9a-f]{64}$' then raise exception 'Código inválido'; end if;
  insert into public.account_recovery (user_id, code_hash, failed, locked_until, updated_at)
  values (auth.uid(), h, 0, null, now())
  on conflict (user_id) do update set code_hash = excluded.code_hash, failed = 0, locked_until = null, updated_at = now();
end $$;
revoke all on function public.set_recovery_hash(text) from public;
grant execute on function public.set_recovery_hash(text) to authenticated;

create or replace function public.has_recovery()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.account_recovery where user_id = auth.uid() and code_hash is not null);
$$;
revoke all on function public.has_recovery() from public;
grant execute on function public.has_recovery() to authenticated;

-- 9) Cache de vídeos do YouTube (escrito só pela função do servidor) -----
create table if not exists public.video_cache (
  rawg_id    int primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.video_cache enable row level security;
drop policy if exists "videos: leitura" on public.video_cache;
create policy "videos: leitura" on public.video_cache for select to authenticated, anon using (true);

-- 10) Tempo real: pedidos de amizade, notificações e mensagens ------------
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['friendships','notifications','messages'] loop
      if not exists (select 1 from pg_publication_tables
                     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;
