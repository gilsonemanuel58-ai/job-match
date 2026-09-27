-- =====================================================================
-- Job Match — Fase 4: candidaturas e painel da empresa
-- Pode rodar mais de uma vez.
-- =====================================================================

-- E-mail de contato no perfil: a empresa precisa dele para chamar para entrevista.
-- Só é visível para o próprio usuário e para empresas cujas vagas ele se candidatou
-- (políticas "own profile read" e "employer sees applicant profile" da 0001).
alter table profiles add column if not exists email text;

-- Preenche para quem já tem perfil (roda como administrador no SQL Editor).
update profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

-- O e-mail do perfil sempre vem da conta autenticada, nunca do que o navegador mandar.
create or replace function set_profile_email() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  new.email := (select email from auth.users where id = new.id);
  return new;
end $$;

drop trigger if exists profiles_set_email on profiles;
create trigger profiles_set_email before insert or update on profiles
  for each row execute function set_profile_email();

-- Empresas não podem marcar vagas como "demo" (isso é só para dados de exemplo nossos).
drop policy if exists "employer creates native jobs" on jobs;
create policy "employer creates native jobs" on jobs for insert
  with check (source = 'native' and not is_demo and is_company_owner(company_id));

drop policy if exists "employer updates own jobs" on jobs;
create policy "employer updates own jobs" on jobs for update
  using (owns_job(id)) with check (source = 'native' and not is_demo and is_company_owner(company_id));

-- Contagem de candidatos por vaga (para o painel da empresa)
create index if not exists applications_job_idx on applications (job_id);

-- Quem se candidatou continua vendo a vaga mesmo depois que ela fecha
-- (para acompanhar o status em "My applications").
create or replace function applied_to_job(jid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from applications where job_id = jid and candidate_id = auth.uid());
$$;

drop policy if exists "applicant reads applied jobs" on jobs;
create policy "applicant reads applied jobs" on jobs for select using (applied_to_job(id));
