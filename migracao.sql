-- =====================================================================
-- Jogos Enzola — migração v2
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

-- 2) Perfil público ----------------------------------------------------
alter table public.profiles
  add column if not exists is_public boolean not null default false;

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
    select user_id, username, nickname, bio, avatar, banner, favorites, now_playing
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

-- 4) Pedidos de amizade em tempo real ---------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'friendships'
     ) then
    execute 'alter publication supabase_realtime add table public.friendships';
  end if;
end $$;
