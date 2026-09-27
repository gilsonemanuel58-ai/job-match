-- =====================================================================
-- Job Match — LIMPA e REINSTALA o esquema (use só enquanto não há dados reais)
-- Pode rodar quantas vezes quiser: o resultado final é sempre o mesmo.
-- =====================================================================
drop table if exists applications, jobs, companies, candidate_profiles, profiles cascade;
drop function if exists check_application_job, touch_updated_at, is_company_owner, owns_job,
  current_role_is, lock_application_fields, lock_profile_role cascade;
drop type if exists user_role, region, visa_status, english_level, employment_type, shift,
  job_source, job_visa_info, job_status, application_status cascade;

-- =====================================================================
-- Job Match — esquema inicial (MVP)
-- Regiões: Dublin City, Dublin regional, Cork, Limerick (Irlanda)
-- Modelo híbrido: vagas nativas (empresa publica) + externas (Careerjet)
-- =====================================================================

-- ---------- Tipos ----------
create type user_role as enum ('candidate', 'employer');

create type region as enum ('dublin_city', 'dublin_county', 'cork', 'limerick');

-- Situação de visto do candidato
create type visa_status as enum ('stamp_2', 'stamp_1g', 'stamp_4', 'eu_eea', 'other');

create type english_level as enum ('basic', 'intermediate', 'advanced', 'fluent');

create type employment_type as enum ('full_time', 'part_time', 'both');

create type shift as enum ('morning', 'afternoon', 'evening', 'night', 'weekend', 'flexible');

create type job_source as enum ('native', 'careerjet');

-- O que a vaga diz sobre visto. 'not_informed' é o padrão: nunca inventar.
create type job_visa_info as enum ('stamp_2_ok', 'work_permit_required', 'eu_only', 'not_informed');

create type job_status as enum ('open', 'closed');

create type application_status as enum ('applied', 'reviewing', 'interview', 'rejected', 'hired');

-- ---------- Tabelas ----------

-- 1 linha por usuário do Supabase Auth
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  full_name   text not null default '',
  created_at  timestamptz not null default now()
);

create table candidate_profiles (
  user_id          uuid primary key references profiles(id) on delete cascade,
  region           region,
  job_areas        text[] not null default '{}',   -- ex.: hospitality, retail, cleaning
  visa             visa_status,
  english          english_level,
  employment_type  employment_type,
  shifts           shift[] not null default '{}',
  available_from   date,
  experience       text,
  skills           text[] not null default '{}',
  languages        text[] not null default '{}',
  cv_path          text,                            -- caminho no Supabase Storage
  updated_at       timestamptz not null default now()
);

create table companies (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  name         text not null,
  region       region,
  website      text,
  description  text,
  is_demo      boolean not null default false,      -- dado de demonstração, exibido como tal
  created_at   timestamptz not null default now()
);

create table jobs (
  id               uuid primary key default gen_random_uuid(),
  source           job_source not null,
  company_id       uuid references companies(id) on delete cascade,  -- só vagas nativas
  company_name     text not null,
  external_id      text,                            -- id no Careerjet
  external_url     text,                            -- link para candidatura externa
  title            text not null,
  description      text not null default '',
  requirements     text,
  region           region not null,
  area             text,
  employment_type  employment_type,
  shifts           shift[] not null default '{}',
  salary_min       numeric(10,2),                   -- null = não informado
  salary_max       numeric(10,2),
  salary_period    text check (salary_period in ('hour', 'week', 'month', 'year')),
  visa_info        job_visa_info not null default 'not_informed',
  visa_signal      text,                            -- trecho do anúncio que gerou o indício (vagas externas)
  english_required english_level,                   -- null = não informado
  requires_ppsn    boolean,                         -- null = não informado
  status           job_status not null default 'open',
  is_demo          boolean not null default false,
  posted_at        timestamptz,
  imported_at      timestamptz,
  created_at       timestamptz not null default now(),

  -- vaga nativa tem empresa; vaga externa tem link e id externo
  constraint native_has_company check (source <> 'native' or company_id is not null),
  constraint external_has_link  check (source <> 'careerjet' or (external_url is not null and external_id is not null)),
  constraint salary_range_ok    check (salary_min is null or salary_max is null or salary_min <= salary_max),
  unique (source, external_id)
);

create index jobs_open_region_idx on jobs (region, status);
create index jobs_company_idx on jobs (company_id);

-- Candidatura interna: só existe para vagas nativas
create table applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references jobs(id) on delete cascade,
  candidate_id  uuid not null references profiles(id) on delete cascade,
  status        application_status not null default 'applied',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create index applications_candidate_idx on applications (candidate_id);

-- ---------- Regras de integridade ----------

-- Não permite candidatura interna em vaga externa ou fechada
create function check_application_job() returns trigger
language plpgsql as $$
begin
  if not exists (
    select 1 from jobs where id = new.job_id and source = 'native' and status = 'open'
  ) then
    raise exception 'Candidatura interna só é permitida em vagas nativas abertas';
  end if;
  return new;
end $$;

create trigger applications_job_check
  before insert on applications
  for each row execute function check_application_job();

-- Atualiza updated_at
create function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger applications_touch before update on applications
  for each row execute function touch_updated_at();
create trigger candidate_profiles_touch before update on candidate_profiles
  for each row execute function touch_updated_at();

-- ---------- Funções auxiliares para RLS ----------
create function is_company_owner(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from companies where id = cid and owner_id = auth.uid());
$$;

create function owns_job(jid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from jobs j join companies c on c.id = j.company_id
    where j.id = jid and c.owner_id = auth.uid()
  );
$$;

create function current_role_is(r user_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = r);
$$;

-- ---------- Row Level Security ----------
alter table profiles           enable row level security;
alter table candidate_profiles enable row level security;
alter table companies          enable row level security;
alter table jobs               enable row level security;
alter table applications       enable row level security;

-- profiles: cada um vê e edita o próprio
create policy "own profile read"   on profiles for select using (id = auth.uid());
create policy "own profile insert" on profiles for insert with check (id = auth.uid());
create policy "own profile update" on profiles for update using (id = auth.uid())
  with check (id = auth.uid());
-- empresa vê o nome de quem se candidatou às suas vagas
create policy "employer sees applicant profile" on profiles for select using (
  exists (select 1 from applications a where a.candidate_id = profiles.id and owns_job(a.job_id))
);

-- candidate_profiles: dono edita; empresa vê perfil de quem se candidatou
create policy "own candidate profile" on candidate_profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and current_role_is('candidate'));
create policy "employer sees applicant details" on candidate_profiles for select using (
  exists (select 1 from applications a where a.candidate_id = candidate_profiles.user_id and owns_job(a.job_id))
);

-- companies: todos leem; só o dono (com papel employer) cria/edita
create policy "companies public read" on companies for select using (true);
create policy "companies owner write" on companies for insert
  with check (owner_id = auth.uid() and current_role_is('employer'));
create policy "companies owner update" on companies for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "companies owner delete" on companies for delete using (owner_id = auth.uid());

-- jobs: vagas abertas são públicas; empresa vê e gerencia as suas
-- vagas externas são inseridas só pelo servidor (service role, ignora RLS)
create policy "open jobs public read" on jobs for select using (status = 'open' or owns_job(id));
create policy "employer creates native jobs" on jobs for insert
  with check (source = 'native' and is_company_owner(company_id));
create policy "employer updates own jobs" on jobs for update
  using (owns_job(id)) with check (source = 'native' and is_company_owner(company_id));
create policy "employer deletes own jobs" on jobs for delete using (owns_job(id));

-- applications: candidato cria e vê as suas; empresa vê e muda status das suas vagas
create policy "candidate reads own applications" on applications for select
  using (candidate_id = auth.uid());
create policy "candidate applies" on applications for insert
  with check (candidate_id = auth.uid() and status = 'applied' and current_role_is('candidate'));
create policy "candidate withdraws" on applications for delete
  using (candidate_id = auth.uid());
create policy "employer reads applications" on applications for select
  using (owns_job(job_id));
create policy "employer updates status" on applications for update
  using (owns_job(job_id)) with check (owns_job(job_id));

-- Impede que a empresa altere candidato/vaga de uma candidatura (só o status)
create function lock_application_fields() returns trigger
language plpgsql as $$
begin
  if new.job_id <> old.job_id or new.candidate_id <> old.candidate_id then
    raise exception 'Só o status da candidatura pode ser alterado';
  end if;
  return new;
end $$;

create trigger applications_lock before update on applications
  for each row execute function lock_application_fields();

-- Papel (candidato/empresa) é escolhido no cadastro e não muda depois
create function lock_profile_role() returns trigger
language plpgsql as $$
begin
  if new.role <> old.role then
    raise exception 'O tipo de conta não pode ser alterado';
  end if;
  return new;
end $$;

create trigger profiles_lock_role before update on profiles
  for each row execute function lock_profile_role();
