-- =====================================================================
-- Jogos Enzola — migração v3 (inclui a v2)
-- Supabase: SQL Editor > New query > cole tudo > Run. Rode ANTES de publicar os arquivos novos do site.
-- Pode rodar de novo quantas vezes quiser: nada é apagado e nada é duplicado (tudo roda numa transação só).
-- =====================================================================

-- 1) Campos novos dos jogos -------------------------------------------
alter table public.games
  add column if not exists hours            numeric,      -- horas jogadas
  add column if not exists metacritic       integer,      -- nota do Metacritic (RAWG)
  add column if not exists playtime         integer,      -- duração média em horas (RAWG)
  add column if not exists rawg_id          integer,      -- id do jogo no RAWG
  add column if not exists steam_id         integer,      -- id do jogo na Steam (jogos que a RAWG não tem)
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

-- 10) Notificações no celular (Web Push) --------------------------------
-- Cada aparelho que ativar as notificações fica registrado aqui.
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push: dono" on public.push_subscriptions;
create policy "push: dono" on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Segredos internos (só a função do servidor lê; o site não tem acesso nenhum).
create table if not exists public.app_secrets (
  k text primary key,
  v text not null
);
alter table public.app_secrets enable row level security;   -- sem políticas = ninguém do site lê
revoke all on public.app_secrets from anon, authenticated;
insert into public.app_secrets (k, v) values ('push_hook', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict (k) do nothing;

-- Quando entra uma notificação (cutucada, sugestão, mensagem, amizade), avisa a função "enzola",
-- que manda o push para o celular. Se algo falhar aqui, a notificação no site continua funcionando.
create extension if not exists pg_net with schema extensions;
create or replace function public.push_notification()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare u text; a text; h text;
begin
  select v into u from public.app_secrets where k = 'function_url';
  select v into a from public.app_secrets where k = 'anon_key';
  select v into h from public.app_secrets where k = 'push_hook';
  if u is null or h is null then return new; end if;
  if not exists (select 1 from public.push_subscriptions where user_id = new.user_id) then return new; end if;
  perform net.http_post(
    url := u,
    body := jsonb_build_object('action', 'push', 'hook', h, 'id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || coalesce(a, ''), 'apikey', coalesce(a, ''))
  );
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists push_notification on public.notifications;
create trigger push_notification after insert on public.notifications for each row execute function public.push_notification();
-- ============ Feed, comentários, curtidas e stories (v8) ============
create or replace function public.is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select a = b or exists (select 1 from public.friendships f where f.status = 'accepted'
    and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a)));
$$;
revoke all on function public.is_friend(uuid, uuid) from public, anon;
grant execute on function public.is_friend(uuid, uuid) to authenticated;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 2000),
  image text check (image is null or char_length(image) <= 500),
  created_at timestamptz not null default now(),
  check (char_length(body) > 0 or image is not null)
);
create index if not exists posts_user_created on public.posts (user_id, created_at desc);
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post on public.post_comments (post_id, created_at);
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  image text check (image is null or char_length(image) <= 500),
  caption text not null default '' check (char_length(caption) <= 300),
  bg smallint not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  check (image is not null or char_length(caption) > 0)
);
create index if not exists stories_user_created on public.stories (user_id, created_at desc);

alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.stories enable row level security;

drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select to authenticated using (public.is_friend(auth.uid(), user_id));
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete to authenticated using (user_id = auth.uid());

drop policy if exists likes_select on public.post_likes;
create policy likes_select on public.post_likes for select to authenticated using (exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists likes_insert on public.post_likes;
create policy likes_insert on public.post_likes for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists likes_delete on public.post_likes;
create policy likes_delete on public.post_likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists comments_select on public.post_comments;
create policy comments_select on public.post_comments for select to authenticated using (exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists comments_insert on public.post_comments;
create policy comments_insert on public.post_comments for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists comments_delete on public.post_comments;
create policy comments_delete on public.post_comments for delete to authenticated using (user_id = auth.uid() or exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()));

drop policy if exists stories_select on public.stories;
create policy stories_select on public.stories for select to authenticated using (user_id = auth.uid() or (expires_at > now() and public.is_friend(auth.uid(), user_id)));
drop policy if exists stories_insert on public.stories;
create policy stories_insert on public.stories for insert to authenticated with check (user_id = auth.uid());
drop policy if exists stories_delete on public.stories;
create policy stories_delete on public.stories for delete to authenticated using (user_id = auth.uid());

revoke all on public.posts, public.post_likes, public.post_comments, public.stories from anon;

-- fotos: bucket público de leitura (nomes impossíveis de adivinhar), cada um escreve só na própria pasta
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('social', 'social', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists social_insert on storage.objects;
create policy social_insert on storage.objects for insert to authenticated with check (bucket_id = 'social' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists social_delete on storage.objects;
create policy social_delete on storage.objects for delete to authenticated using (bucket_id = 'social' and (storage.foldername(name))[1] = auth.uid()::text);

-- marcar amigos nos posts
alter table public.posts add column if not exists tags uuid[] not null default '{}' check (cardinality(tags) <= 10);
create or replace function public.posts_clean_tags() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.tags := coalesce((select array_agg(distinct t) from unnest(new.tags) t where t <> new.user_id and public.is_friend(new.user_id, t)), '{}');
  return new;
end $$;
drop trigger if exists posts_clean_tags on public.posts;
create trigger posts_clean_tags before insert on public.posts for each row execute function public.posts_clean_tags();

-- notificações do feed: marcação, curtida e comentário (gatilhos; o aviso no celular sai pela função "enzola")
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in ('poke','suggest','message','friend_request','friend_accept','tag','like','comment'));
-- (funções notify_post_tags / notify_post_like / notify_post_comment e seus gatilhos: ver migração "notify_feed" no Supabase)

-- ===== Grupos do Enzolingo: ofensiva coletiva, pontos e metas =====
create table if not exists public.group_activity (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  points int not null default 0 check (points >= 0),
  primary key (group_id, user_id, day)
);
create table if not exists public.group_claims (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tier int not null,
  primary key (group_id, user_id, tier)
);
alter table public.group_activity enable row level security;
alter table public.group_claims enable row level security;
drop policy if exists ga_select on public.group_activity;
create policy ga_select on public.group_activity for select to authenticated using (public.is_group_member(group_id, auth.uid()));
drop policy if exists gc_select on public.group_claims;
create policy gc_select on public.group_claims for select to authenticated using (user_id = auth.uid());

create or replace function public.group_log(p_points int) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'America/Sao_Paulo')::date; p int := least(greatest(coalesce(p_points,0),0),100);
begin
  if auth.uid() is null or p = 0 then return; end if;
  insert into group_activity(group_id,user_id,day,points)
  select g.id, auth.uid(), d, p from groups g where public.is_group_member(g.id, auth.uid())
  on conflict (group_id,user_id,day) do update set points = group_activity.points + excluded.points;
end $$;

create or replace function public.group_claim(gid uuid, p_tier int) returns boolean
language plpgsql security definer set search_path = public as $$
declare th int[] := array[100,250,500,1000,2000]; tot bigint; n int;
begin
  if auth.uid() is null or not public.is_group_member(gid, auth.uid()) then return false; end if;
  if p_tier < 0 or p_tier > 4 then return false; end if;
  select coalesce(sum(points),0) into tot from group_activity where group_id = gid;
  if tot < th[p_tier+1] then return false; end if;
  insert into group_claims(group_id,user_id,tier) values (gid, auth.uid(), p_tier) on conflict do nothing;
  get diagnostics n = row_count; return n > 0;
end $$;
revoke all on function public.group_log(int), public.group_claim(uuid,int) from public, anon;
grant execute on function public.group_log(int), public.group_claim(uuid,int) to authenticated;

-- ===== Salas: chat de texto por grupo e chamadas (voz, câmera e tela) =====
-- Pode rodar de novo: não apaga nada. Se a tabela já existir, só garante as regras de acesso.
create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists group_messages_group_idx on public.group_messages (group_id, created_at desc);
alter table public.group_messages enable row level security;
drop policy if exists "salas: membros leem" on public.group_messages;
create policy "salas: membros leem" on public.group_messages for select to authenticated using (public.is_group_member(group_id, auth.uid()));
drop policy if exists "salas: membros escrevem" on public.group_messages;
create policy "salas: membros escrevem" on public.group_messages for insert to authenticated with check (user_id = auth.uid() and public.is_group_member(group_id, auth.uid()));
drop policy if exists "salas: autor apaga" on public.group_messages;
create policy "salas: autor apaga" on public.group_messages for delete to authenticated using (user_id = auth.uid());
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'group_messages') then
    alter publication supabase_realtime add table public.group_messages;
  end if;
end $$;
-- Canal privado "call:<id do grupo>" (presença + sinalização das chamadas): só membros do grupo entram e enviam.
drop policy if exists "salas: membros ouvem a chamada" on realtime.messages;
create policy "salas: membros ouvem a chamada" on realtime.messages for select to authenticated using (
  case when realtime.topic() ~ '^call:[0-9a-f-]{36}$' then public.is_group_member(substring(realtime.topic() from 6)::uuid, auth.uid()) else false end);
drop policy if exists "salas: membros falam na chamada" on realtime.messages;
create policy "salas: membros falam na chamada" on realtime.messages for insert to authenticated with check (
  case when realtime.topic() ~ '^call:[0-9a-f-]{36}$' then public.is_group_member(substring(realtime.topic() from 6)::uuid, auth.uid()) else false end);

-- =====================================================================
-- ===== Carteira no servidor: Enzola Coins, skins, álbum e baús =====
-- O saldo não fica mais no navegador: só as funções abaixo mexem nele, com limites por jogada e por dia.
-- Rode este arquivo ANTES de publicar os arquivos novos do site (ele importa o saldo atual de cada um).
-- =====================================================================
create or replace function public.w_today() returns date language sql stable as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;
create table if not exists public.wallets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  coins      integer not null default 0 check (coins >= 0),
  skins      jsonb not null default '{}'::jsonb,     -- {"festeiro": true}
  album      jsonb not null default '{}'::jsonb,     -- {"h01": 2}  (quantidade de cada foto)
  chests     jsonb not null default '{}'::jsonb,     -- {"comum": 1, "raro": 0}
  free_day   date,
  free_n     integer not null default 0,
  welcome    boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.wallets enable row level security;
drop policy if exists "carteira: ver a minha" on public.wallets;
create policy "carteira: ver a minha" on public.wallets for select to authenticated using (user_id = auth.uid());
-- (sem políticas de escrita: ninguém altera direto, só pelas funções)

create table if not exists public.wallet_log (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null default public.w_today(),
  kind       text not null,          -- earn, chest_earn, free, buy_skin, buy_chest, open, race, xf_out, xf_back, xf_in, xf_want_in, claim, group, import
  source     text,
  coins      integer not null default 0,
  item       text,
  ref        text,
  created_at timestamptz not null default now()
);
create unique index if not exists wallet_log_ref on public.wallet_log (user_id, kind, ref) where ref is not null;
create index if not exists wallet_log_day on public.wallet_log (user_id, day, kind, source);
alter table public.wallet_log enable row level security;   -- sem políticas: só o servidor lê

-- catálogo: preços, chances e limites ficam no banco (o site só mostra)
create table if not exists public.shop_skins (id text primary key, price integer not null default 0, buyable boolean not null default true);
create table if not exists public.album_photos (id text primary key, rar numeric not null default 1);
create table if not exists public.shop_chests (rar text primary key, price integer not null, draws integer not null, p_photo integer not null, p_coins integer not null, p_skin integer not null,
  coins jsonb not null, skin_exp numeric not null default 0, guarantee_skin boolean not null default false, ord integer not null default 0);
create table if not exists public.earn_rules (source text primary key, per_call integer not null, per_day integer not null);
create table if not exists public.chest_rules (source text not null, rar text not null, per_day integer not null, primary key (source, rar));
alter table public.shop_skins enable row level security; alter table public.album_photos enable row level security; alter table public.shop_chests enable row level security;
alter table public.earn_rules enable row level security; alter table public.chest_rules enable row level security;
drop policy if exists "catalogo: leitura" on public.shop_skins;   create policy "catalogo: leitura" on public.shop_skins   for select to authenticated using (true);
drop policy if exists "catalogo: leitura" on public.album_photos; create policy "catalogo: leitura" on public.album_photos for select to authenticated using (true);
drop policy if exists "catalogo: leitura" on public.shop_chests;  create policy "catalogo: leitura" on public.shop_chests  for select to authenticated using (true);
drop policy if exists "catalogo: leitura" on public.earn_rules;   create policy "catalogo: leitura" on public.earn_rules   for select to authenticated using (true);
drop policy if exists "catalogo: leitura" on public.chest_rules;  create policy "catalogo: leitura" on public.chest_rules  for select to authenticated using (true);

insert into public.shop_skins (id, price, buyable) values ('festeiro',50,true),('chef',75,true),('fone',100,true),('pirata',100,true),('cauboi',125,true),('mago',150,true),('cavalheiro',190,true),('heroi',225,true),('cruzeirense',250,true),('rei',310,true),('dourado',500,true),('c10',75,true),('c1',90,true),('c11',90,true),('c17',90,true),('c14',100,true),('c2',110,true),('c9',110,true),('c13',110,true),('c3',125,true),('c15',125,true),('c4',140,true),('c6',150,true),('c12',160,true),('x-pato',90,true),('x-hamster',110,true),('x-lagartixa',125,true),('x-padre',150,true),('c16',175,true)
on conflict (id) do update set price = excluded.price, buyable = excluded.buyable;
insert into public.album_photos (id, rar) values ('h01',1),('h02',1),('h03',1),('h04',1),('h05',1),('h06',1),('h07',1),('h08',1),('h09',1),('h10',1),('h11',1),('h12',1),('h13',1),('h14',1),('h15',1),('h16',1),('h17',1),('h18',1),('h19',1),('h20',1),('h21',1),('h22',1),('h23',1),('h24',1),('h25',1),('h26',1),('h27',1),('h28',1),('h29',1),('h30',1),('h31',1),('h32',1),('h33',1),('h34',1),('h35',1),('h36',1),('h37',1),('h38',1),('h39',1),('h40',1),('h41',1),('h42',1),('h43',1),('h44',1),('h45',1),('h46',1),('h47',1),('h48',1),('h49',1),('h50',1),('h51',1),('h52',1),('h53',1),('h54',1),('h55',1),('h56',1),('h57',1),('h58',1),('h59',1),('h60',1),('h61',1),('h62',1),('h63',1),('h64',1),('h65',1)
on conflict (id) do update set rar = excluded.rar;
insert into public.shop_chests (rar, price, draws, p_photo, p_coins, p_skin, coins, skin_exp, guarantee_skin, ord) values
  ('comum',75,3,40,50,10,'[[5,40],[10,30],[20,18],[35,8],[60,3],[100,1]]',0.5,false,0),
  ('raro',190,3,34,46,20,'[[10,28],[20,30],[35,22],[60,12],[100,6],[200,2]]',0.25,false,1),
  ('epico',500,4,30,40,30,'[[35,26],[60,30],[100,26],[200,14],[300,4]]',0,false,2),
  ('lendario',1250,5,26,32,42,'[[100,30],[200,34],[300,24],[500,12]]',-0.4,true,3)
on conflict (rar) do update set price = excluded.price, draws = excluded.draws, p_photo = excluded.p_photo, p_coins = excluded.p_coins, p_skin = excluded.p_skin, coins = excluded.coins, skin_exp = excluded.skin_exp, guarantee_skin = excluded.guarantee_skin, ord = excluded.ord;
insert into public.shop_skins (id, price, buyable) values ('ff', 0, false), ('ave', 0, false), ('colecionador', 0, false)
on conflict (id) do update set price = excluded.price, buyable = excluded.buyable;
-- moedas por origem: máximo por jogada e por dia (dia de Brasília)
insert into public.earn_rules (source, per_call, per_day) values
  ('lingo', 60, 250), ('show', 90, 300), ('snake', 50, 80), ('cards', 40, 80), ('find', 20, 60), ('puzzle', 6, 60)
on conflict (source) do update set per_call = excluded.per_call, per_day = excluded.per_day;
-- baús ganhos jogando: máximo por dia
insert into public.chest_rules (source, rar, per_day) values
  ('lingo_goal', 'raro', 1), ('lingo_perfect', 'comum', 3), ('show', 'comum', 3), ('show', 'raro', 2), ('show', 'epico', 1)
on conflict (source, rar) do update set per_day = excluded.per_day;

-- ---------- ajudantes (não ficam disponíveis para o site) ----------
create or replace function public.w_int(v jsonb) returns integer language sql immutable as $$
  select case when jsonb_typeof(v) = 'number' then greatest(0, floor((v #>> '{}')::numeric))::int
              when jsonb_typeof(v) = 'string' and (v #>> '{}') ~ '^\d{1,9}$' then (v #>> '{}')::int else 0 end $$;
create or replace function public.w_inc(j jsonb, k text, n integer) returns jsonb language sql immutable as $$
  select jsonb_set(coalesce(j, '{}'::jsonb), array[k], to_jsonb(greatest(0, public.w_int(coalesce(j, '{}'::jsonb) -> k) + n))) $$;
create or replace function public.w_lock(uid uuid) returns public.wallets
language plpgsql security definer set search_path = public as $$
declare w public.wallets;
begin
  if uid is null then raise exception 'Faça login primeiro'; end if;
  insert into public.wallets (user_id) values (uid) on conflict do nothing;
  select * into w from public.wallets where user_id = uid for update;
  if not w.welcome then   -- baú de boas-vindas do álbum (uma vez)
    update public.wallets set welcome = true, chests = public.w_inc(chests, 'comum', 1) where user_id = uid returning * into w;
  end if;
  return w;
end $$;
create or replace function public.w_json(uid uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('coins', w.coins, 'skins', w.skins, 'album', w.album, 'chests', w.chests,
    'free_left', greatest(0, 2 - case when w.free_day = public.w_today() then w.free_n else 0 end))
  from public.wallets w where w.user_id = uid $$;
revoke all on function public.w_lock(uuid), public.w_json(uuid) from public, anon, authenticated;

-- ---------- importação única do saldo que estava no navegador/perfil ----------
insert into public.wallets (user_id, coins, skins, album, chests, free_day, free_n, welcome)
select p.user_id,
  public.w_int(l -> 'goiabas'),
  coalesce((select jsonb_object_agg(case when k = 'oculos' then 'pirata' else k end, true) from jsonb_each(case when jsonb_typeof(l -> 'skins') = 'object' then l -> 'skins' else '{}' end) e(k, v)
            where v = 'true'::jsonb and exists (select 1 from public.shop_skins s where s.id = case when k = 'oculos' then 'pirata' else k end)), '{}'::jsonb),
  coalesce((select jsonb_object_agg(k, public.w_int(v)) from jsonb_each(case when jsonb_typeof(l -> 'album') = 'object' then l -> 'album' else '{}' end) e(k, v)
            where public.w_int(v) > 0 and exists (select 1 from public.album_photos a where a.id = k)), '{}'::jsonb),
  public.w_inc(coalesce((select jsonb_object_agg(k, public.w_int(v)) from jsonb_each(case when jsonb_typeof(l -> 'cx') = 'object' then l -> 'cx' else '{}' end) e(k, v)
            where k in ('comum', 'raro', 'epico', 'lendario') and public.w_int(v) > 0), '{}'::jsonb), 'comum', public.w_int(l -> 'chests')),
  case when (l -> 'free' ->> 'day') ~ '^\d{4}-\d{2}-\d{2}$' then (l -> 'free' ->> 'day')::date end,
  public.w_int(l -> 'free' -> 'n'),
  coalesce(l ->> 'bauWelcome', 'false') = 'true'
from public.profiles p cross join lateral (select case when jsonb_typeof(p.settings -> 'lingo') = 'object' then p.settings -> 'lingo' else '{}'::jsonb end as l) x
where exists (select 1 from auth.users u where u.id = p.user_id)
on conflict (user_id) do nothing;
-- propostas de troca em aberto: o item já tinha saído do inventário de quem enviou
insert into public.wallet_log (user_id, kind, ref)
select t.from_user, 'xf_out', t.id::text from public.item_transfers t where t.status = 'pending'
on conflict do nothing;

-- ---------- funções que o site chama ----------
create or replace function public.wallet_get() returns jsonb
language plpgsql security definer set search_path = public as $$
begin perform public.w_lock(auth.uid()); return public.w_json(auth.uid()); end $$;

-- ganhar moedas jogando (limitado por jogada e por dia em earn_rules)
create or replace function public.wallet_earn(p_source text, p_coins integer, p_ref text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r public.earn_rules; used integer; amt integer; rf text := case when p_ref is null then null else p_source || ':' || left(p_ref, 80) end;
begin
  perform public.w_lock(uid);
  select * into r from public.earn_rules where source = p_source;
  if not found then raise exception 'Origem de moedas inválida'; end if;
  amt := least(greatest(coalesce(p_coins, 0), 0), r.per_call);
  if rf is not null and exists (select 1 from public.wallet_log where user_id = uid and kind = 'earn' and ref = rf) then amt := 0; end if;
  select coalesce(sum(coins), 0) into used from public.wallet_log where user_id = uid and day = public.w_today() and kind = 'earn' and source = p_source;
  amt := least(amt, greatest(r.per_day - used, 0));
  if amt > 0 then
    update public.wallets set coins = coins + amt, updated_at = now() where user_id = uid;
    insert into public.wallet_log (user_id, kind, source, coins, ref) values (uid, 'earn', p_source, amt, rf);
  end if;
  return jsonb_build_object('got', amt, 'wallet', public.w_json(uid));
end $$;

-- ganhar baú jogando (limite por dia em chest_rules)
create or replace function public.wallet_chest_earn(p_source text, p_rar text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); lim integer; used integer;
begin
  perform public.w_lock(uid);
  select per_day into lim from public.chest_rules where source = p_source and rar = p_rar;
  if lim is null then raise exception 'Baú inválido'; end if;
  select count(*) into used from public.wallet_log where user_id = uid and day = public.w_today() and kind = 'chest_earn' and source = p_source and item = p_rar;
  if used >= lim then return jsonb_build_object('got', 0, 'wallet', public.w_json(uid)); end if;
  update public.wallets set chests = public.w_inc(chests, p_rar, 1), updated_at = now() where user_id = uid;
  insert into public.wallet_log (user_id, kind, source, item) values (uid, 'chest_earn', p_source, p_rar);
  return jsonb_build_object('got', 1, 'wallet', public.w_json(uid));
end $$;

-- 2 baús comuns grátis por dia
create or replace function public.wallet_free_chest() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; n integer;
begin
  w := public.w_lock(uid);
  n := case when w.free_day = public.w_today() then w.free_n else 0 end;
  if n >= 2 then raise exception 'Os baús grátis de hoje já foram pegos'; end if;
  update public.wallets set free_day = public.w_today(), free_n = n + 1, chests = public.w_inc(chests, 'comum', 1), updated_at = now() where user_id = uid;
  insert into public.wallet_log (user_id, kind, item) values (uid, 'free', 'comum');
  return public.w_json(uid);
end $$;

create or replace function public.wallet_buy_skin(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; pr integer;
begin
  w := public.w_lock(uid);
  select price into pr from public.shop_skins where id = p_id and buyable and price > 0;
  if pr is null then raise exception 'Skin indisponível'; end if;
  if w.skins ? p_id then raise exception 'Você já tem essa skin'; end if;
  if w.coins < pr then raise exception 'Faltam % Enzola Coins', pr - w.coins; end if;
  update public.wallets set coins = coins - pr, skins = skins || jsonb_build_object(p_id, true), updated_at = now() where user_id = uid;
  insert into public.wallet_log (user_id, kind, coins, item) values (uid, 'buy_skin', -pr, p_id);
  return public.w_json(uid);
end $$;

create or replace function public.wallet_buy_chest(p_rar text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; pr integer;
begin
  w := public.w_lock(uid);
  select price into pr from public.shop_chests where rar = p_rar;
  if pr is null then raise exception 'Baú inválido'; end if;
  if w.coins < pr then raise exception 'Faltam % Enzola Coins', pr - w.coins; end if;
  update public.wallets set coins = coins - pr, chests = public.w_inc(chests, p_rar, 1), updated_at = now() where user_id = uid;
  insert into public.wallet_log (user_id, kind, coins, item) values (uid, 'buy_chest', -pr, p_rar);
  return public.w_json(uid);
end $$;

-- abrir baú: o sorteio acontece aqui, no servidor
create or replace function public.wallet_open_chest(p_rar text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; c public.shop_chests; got jsonb := '[]'::jsonb; i integer; k text; r numeric; sid text; amt integer; pid text; had integer;
begin
  w := public.w_lock(uid);
  if p_rar is null or public.w_int(w.chests -> p_rar) < 1 then
    select s.rar into p_rar from public.shop_chests s where public.w_int(w.chests -> s.rar) > 0 order by s.ord desc limit 1;
    if p_rar is null then raise exception 'Você não tem baús para abrir'; end if;
  end if;
  select * into c from public.shop_chests where rar = p_rar;
  w.chests := public.w_inc(w.chests, p_rar, -1);
  for i in 1..c.draws loop
    if c.guarantee_skin and i = 1 then k := 'skin';
    else r := random() * 100; k := case when r < c.p_photo then 'photo' when r < c.p_photo + c.p_coins then 'coins' else 'skin' end; end if;
    if k = 'photo' and not exists (select 1 from public.album_photos) then k := 'coins'; end if;
    if k = 'skin' then
      -- sorteio com peso: skins mais caras são mais raras nos baús baixos (peso = preço ^ -skin_exp)
      select s.id into sid from public.shop_skins s where s.buyable and s.price > 0 and not (w.skins ? s.id)
        order by -ln(1 - random()) / power(s.price::numeric, -c.skin_exp) limit 1;
      if sid is not null then w.skins := w.skins || jsonb_build_object(sid, true); got := got || jsonb_build_array(jsonb_build_object('t', 'skin', 'id', sid, 'fresh', true));
      else k := 'coins'; end if;
    end if;
    if k = 'coins' then
      select (e ->> 0)::int into amt from jsonb_array_elements(c.coins) e order by -ln(1 - random()) / (e ->> 1)::numeric limit 1;
      w.coins := w.coins + amt; got := got || jsonb_build_array(jsonb_build_object('t', 'coins', 'n', amt));
    elsif k = 'photo' then
      select a.id into pid from public.album_photos a order by -ln(1 - random()) / a.rar limit 1;
      had := public.w_int(w.album -> pid);
      w.album := public.w_inc(w.album, pid, 1); got := got || jsonb_build_array(jsonb_build_object('t', 'photo', 'id', pid, 'fresh', had = 0));
    end if;
  end loop;
  update public.wallets set coins = w.coins, skins = w.skins, album = w.album, chests = w.chests, updated_at = now() where user_id = uid;
  insert into public.wallet_log (user_id, kind, item, coins) values (uid, 'open', p_rar, 0);
  return jsonb_build_object('rar', p_rar, 'got', got, 'wallet', public.w_json(uid));
end $$;

-- skins de conquista: Colecionador (álbum completo) e Pássaro (todas as lições do Enzolingo)
create or replace function public.wallet_claim_skin(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; ok boolean := false; total integer; done integer;
begin
  w := public.w_lock(uid);
  if w.skins ? p_id then return public.w_json(uid); end if;
  if p_id = 'colecionador' then
    select count(*) into total from public.album_photos;
    ok := total > 0 and (select count(*) from public.album_photos a where public.w_int(w.album -> a.id) > 0) = total;
  elsif p_id = 'ave' then
    -- 2 idiomas × 14 unidades × 4 lições
    select count(*) into done from public.profiles p, jsonb_each(case when jsonb_typeof(p.settings -> 'lingo' -> 'done') = 'object' then p.settings -> 'lingo' -> 'done' else '{}' end) e(k, v)
      where p.user_id = uid and v = 'true'::jsonb;
    ok := done >= 112;
  end if;
  if not ok then raise exception 'Conquista ainda não liberada'; end if;
  update public.wallets set skins = skins || jsonb_build_object(p_id, true), updated_at = now() where user_id = uid;
  insert into public.wallet_log (user_id, kind, item) values (uid, 'claim', p_id);
  return public.w_json(uid);
end $$;

-- ---------- Corrida de Hipopótamos: o servidor sorteia os corredores e o vencedor ----------
create table if not exists public.race_rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  runners jsonb not null, status text not null default 'open', pick integer, bet integer, winner integer,
  created_at timestamptz not null default now()
);
alter table public.race_rounds enable row level security;   -- sem políticas: só pelas funções
create or replace function public.race_deal() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); ids text[]; forms integer[]; tot numeric; rs jsonb := '[]'::jsonb; i integer; rid uuid;
begin
  if uid is null then raise exception 'Faça login primeiro'; end if;
  delete from public.race_rounds where user_id = uid and (status = 'open' or created_at < now() - interval '2 days');
  ids := array(select x from unnest(array['classico','festeiro','chef','fone','pirata','cauboi','mago','cavalheiro','heroi','cruzeirense','rei','dourado']) x order by random() limit 5);
  loop
    forms := array(select 1 + floor(random() * 5)::int from generate_series(1, 5));
    exit when (select count(distinct f) from unnest(forms) f) >= 3;
  end loop;
  select sum(1 + 0.45 * (f - 1)) into tot from unnest(forms) f;
  for i in 1..5 loop
    rs := rs || jsonb_build_array(jsonb_build_object('id', ids[i], 'form', forms[i], 'chance', round((1 + 0.45 * (forms[i] - 1)) / tot, 4)));
  end loop;
  insert into public.race_rounds (user_id, runners) values (uid, rs) returning id into rid;
  return jsonb_build_object('id', rid, 'runners', rs);
end $$;
create or replace function public.race_bet(p_round uuid, p_pick integer, p_bet integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); rr public.race_rounds; w public.wallets; r numeric; acc numeric := 0; win integer; pay integer; i integer;
begin
  w := public.w_lock(uid);
  select * into rr from public.race_rounds where id = p_round and user_id = uid and status = 'open' for update;
  if not found then raise exception 'Corrida não encontrada. Sorteie novos corredores.'; end if;
  if p_pick is null or p_pick < 0 or p_pick > 4 then raise exception 'Escolha um hipopótamo'; end if;
  if p_bet is null or p_bet < 5 or p_bet > 100 then raise exception 'Aposta de 5 a 100 Enzola Coins'; end if;
  if w.coins < p_bet then raise exception 'Enzola Coins insuficientes'; end if;
  r := random();
  for i in 0..4 loop acc := acc + (rr.runners -> i ->> 'chance')::numeric; if r < acc then win := i; exit; end if; end loop;
  win := coalesce(win, 4);
  pay := case when win = p_pick then p_bet * 2 else 0 end;
  update public.wallets set coins = coins - p_bet + pay, updated_at = now() where user_id = uid;
  update public.race_rounds set status = 'done', pick = p_pick, bet = p_bet, winner = win where id = rr.id;
  insert into public.wallet_log (user_id, kind, coins, ref) values (uid, 'race', pay - p_bet, rr.id::text);
  return jsonb_build_object('winner', win, 'pay', pay, 'wallet', public.w_json(uid));
end $$;

-- ---------- trocas e presentes: o item sai e entra pelo servidor ----------
create or replace function public.w_xf_settle(uid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t record; pr integer; applied jsonb := '[]'::jsonb;
begin
  for t in select x.* from public.item_transfers x
           where (x.from_user = uid or x.to_user = uid) and x.status in ('accepted', 'declined', 'cancelled')
             and exists (select 1 from public.wallet_log l where l.user_id = x.from_user and l.kind = 'xf_out' and l.ref = x.id::text)
  loop
    if t.from_user = uid then
      if t.status in ('declined', 'cancelled') and not exists (select 1 from public.wallet_log where user_id = uid and kind = 'xf_back' and ref = t.id::text) then
        if t.give ->> 't' = 'photo' then update public.wallets set album = public.w_inc(album, t.give ->> 'id', 1) where user_id = uid;
        else select price into pr from public.shop_skins where id = t.give ->> 'id'; update public.wallets set coins = coins + coalesce(pr, 0) where user_id = uid; end if;
        insert into public.wallet_log (user_id, kind, ref, item) values (uid, 'xf_back', t.id::text, t.give ->> 'id');
        applied := applied || jsonb_build_array(t.id);
      elsif t.status = 'accepted' and t.kind = 'trade' and t.want is not null and not exists (select 1 from public.wallet_log where user_id = uid and kind = 'xf_want_in' and ref = t.id::text) then
        update public.wallets set album = public.w_inc(album, t.want ->> 'id', 1) where user_id = uid;
        insert into public.wallet_log (user_id, kind, ref, item) values (uid, 'xf_want_in', t.id::text, t.want ->> 'id');
        applied := applied || jsonb_build_array(t.id);
      end if;
    end if;
    if t.to_user = uid and t.status = 'accepted' and not exists (select 1 from public.wallet_log where user_id = uid and kind = 'xf_in' and ref = t.id::text) then
      if t.give ->> 't' = 'photo' then update public.wallets set album = public.w_inc(album, t.give ->> 'id', 1) where user_id = uid;
      elsif exists (select 1 from public.wallets where user_id = uid and skins ? (t.give ->> 'id')) then
        select price into pr from public.shop_skins where id = t.give ->> 'id'; update public.wallets set coins = coins + coalesce(pr, 0) where user_id = uid;
      else update public.wallets set skins = skins || jsonb_build_object(t.give ->> 'id', true) where user_id = uid; end if;
      if t.kind = 'trade' and t.want is not null then update public.wallets set album = public.w_inc(album, t.want ->> 'id', -1) where user_id = uid; end if;
      insert into public.wallet_log (user_id, kind, ref, item) values (uid, 'xf_in', t.id::text, t.give ->> 'id');
      applied := applied || jsonb_build_array(t.id);
    end if;
  end loop;
  return applied;
end $$;
revoke all on function public.w_xf_settle(uuid) from public, anon, authenticated;
-- quem envia: depois de criar a proposta, reserva o item (foto repetida ou o preço da skin de presente)
create or replace function public.wallet_xf_reserve(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; t public.item_transfers; pr integer;
begin
  w := public.w_lock(uid);
  select * into t from public.item_transfers where id = p_id and from_user = uid;
  if not found then raise exception 'Proposta não encontrada'; end if;
  if exists (select 1 from public.wallet_log where user_id = uid and kind = 'xf_out' and ref = p_id::text) then return public.w_json(uid); end if;
  if t.status <> 'pending' then raise exception 'Proposta já encerrada'; end if;
  if t.give ->> 't' = 'photo' then
    if public.w_int(w.album -> (t.give ->> 'id')) < 2 then raise exception 'Você só pode enviar fotos repetidas'; end if;
    update public.wallets set album = public.w_inc(album, t.give ->> 'id', -1), updated_at = now() where user_id = uid;
  elsif t.give ->> 't' = 'skin' then
    select price into pr from public.shop_skins where id = t.give ->> 'id' and buyable and price > 0;
    if pr is null then raise exception 'Skin indisponível para presente'; end if;
    if w.coins < pr then raise exception 'Enzola Coins insuficientes'; end if;
    update public.wallets set coins = coins - pr, updated_at = now() where user_id = uid;
  else raise exception 'Item inválido'; end if;
  insert into public.wallet_log (user_id, kind, ref, item, coins) values (uid, 'xf_out', p_id::text, t.give ->> 'id', -coalesce(pr, 0));
  return public.w_json(uid);
end $$;
-- quem recebe: aceitar/recusar passa por aqui (confere a foto pedida na troca) e já recebe o item
create or replace function public.wallet_xf_respond(p_id uuid, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); w public.wallets; t public.item_transfers; res jsonb; a jsonb;
begin
  w := public.w_lock(uid);
  select * into t from public.item_transfers where id = p_id and to_user = uid and status = 'pending';
  if not found then raise exception 'Proposta não encontrada'; end if;
  if p_accept and t.kind = 'trade' and t.want is not null and public.w_int(w.album -> (t.want ->> 'id')) < 2 then
    raise exception 'Você precisa de uma cópia repetida da foto pedida';
  end if;
  res := to_jsonb(public.transfer_respond(p_id => p_id, p_accept => p_accept));
  a := public.w_xf_settle(uid);   -- antes de montar a resposta (senão o saldo volta com a "foto" de antes)
  return jsonb_build_object('transfer', res, 'applied', a, 'wallet', public.w_json(uid));
end $$;
-- acerta trocas encerradas (devolução de recusadas/canceladas, foto recebida em troca aceita)
create or replace function public.wallet_xf_settle() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); a jsonb;
begin
  perform public.w_lock(uid); a := public.w_xf_settle(uid);
  return jsonb_build_object('applied', a, 'wallet', public.w_json(uid));
end $$;

-- ---------- metas de grupo: as moedas (e a skin Free Fire) entram pelo servidor ----------
create or replace function public.group_claim(gid uuid, p_tier int) returns boolean
language plpgsql security definer set search_path = public as $$
declare th int[] := array[100,250,500,1000,2000]; rw int[] := array[20,40,80,150,300]; tot bigint; n int; uid uuid := auth.uid();
begin
  if uid is null or not public.is_group_member(gid, uid) then return false; end if;
  if p_tier < 0 or p_tier > 4 then return false; end if;
  select coalesce(sum(points),0) into tot from group_activity where group_id = gid;
  if tot < th[p_tier+1] then return false; end if;
  insert into group_claims(group_id,user_id,tier) values (gid, uid, p_tier) on conflict do nothing;
  get diagnostics n = row_count;
  if n > 0 then
    perform public.w_lock(uid);
    update public.wallets set coins = coins + rw[p_tier+1], skins = case when p_tier = 4 then skins || '{"ff": true}'::jsonb else skins end, updated_at = now() where user_id = uid;
    insert into public.wallet_log (user_id, kind, source, coins, ref) values (uid, 'group', 'group', rw[p_tier+1], gid::text || ':' || p_tier);
  end if;
  return n > 0;
end $$;

-- skin no avatar/banner: só quem tem
create or replace function public.profiles_skin_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare s text;
begin
  foreach s in array array[new.avatar, new.banner] loop
    if s like 'skin:%' and substr(s, 6) <> 'classico'
       and (tg_op = 'INSERT' or s is distinct from old.avatar and s is distinct from old.banner)
       and not exists (select 1 from public.wallets w where w.user_id = new.user_id and w.skins ? substr(s, 6)) then
      raise exception 'Você ainda não tem essa skin';
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists profiles_skin_guard on public.profiles;
create trigger profiles_skin_guard before insert or update of avatar, banner on public.profiles for each row execute function public.profiles_skin_guard();

revoke all on function public.wallet_get(), public.wallet_earn(text, integer, text), public.wallet_chest_earn(text, text), public.wallet_free_chest(),
  public.wallet_buy_skin(text), public.wallet_buy_chest(text), public.wallet_open_chest(text), public.wallet_claim_skin(text),
  public.race_deal(), public.race_bet(uuid, integer, integer), public.wallet_xf_reserve(uuid), public.wallet_xf_respond(uuid, boolean), public.wallet_xf_settle() from public, anon;
grant execute on function public.wallet_get(), public.wallet_earn(text, integer, text), public.wallet_chest_earn(text, text), public.wallet_free_chest(),
  public.wallet_buy_skin(text), public.wallet_buy_chest(text), public.wallet_open_chest(text), public.wallet_claim_skin(text),
  public.race_deal(), public.race_bet(uuid, integer, integer), public.wallet_xf_reserve(uuid), public.wallet_xf_respond(uuid, boolean), public.wallet_xf_settle() to authenticated;
-- aceitar trocas só pela função que confere a foto pedida
do $$ begin
  revoke execute on function public.transfer_respond(uuid, boolean) from public, anon, authenticated;
exception when others then raise notice 'transfer_respond: assinatura diferente, mantida como está';
end $$;
