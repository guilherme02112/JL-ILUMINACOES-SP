-- Rode este arquivo uma vez no Supabase: SQL Editor → New query → cole tudo → Run.
-- Antes, crie o usuário editor em Authentication → Users → Add user (com "Auto Confirm User"),
-- usando o mesmo e-mail que está em supabase-config.js (emailEditor).

-- Conteúdo do site (produtos e fotos da galeria) numa única linha
create table if not exists public.conteudo (
  id int primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table public.conteudo enable row level security;

drop policy if exists "todos leem" on public.conteudo;
drop policy if exists "editor cria" on public.conteudo;
drop policy if exists "editor altera" on public.conteudo;
create policy "todos leem" on public.conteudo for select using (true);
create policy "editor cria" on public.conteudo for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'editor@jl-iluminacoes.site');
create policy "editor altera" on public.conteudo for update to authenticated
  using ((auth.jwt() ->> 'email') = 'editor@jl-iluminacoes.site')
  with check ((auth.jwt() ->> 'email') = 'editor@jl-iluminacoes.site');

-- Bucket público para as fotos (qualquer um vê; só o editor envia/apaga)
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
  on conflict (id) do update set public = true;

drop policy if exists "editor envia fotos" on storage.objects;
drop policy if exists "editor altera fotos" on storage.objects;
drop policy if exists "editor apaga fotos" on storage.objects;
create policy "editor envia fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (auth.jwt() ->> 'email') = 'editor@jl-iluminacoes.site');
create policy "editor altera fotos" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (auth.jwt() ->> 'email') = 'editor@jl-iluminacoes.site');
create policy "editor apaga fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (auth.jwt() ->> 'email') = 'editor@jl-iluminacoes.site');
