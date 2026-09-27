-- Teste das regras de segurança. Cada linha "PASS/FAIL" é verificada.
\set c1 '11111111-1111-1111-1111-111111111111'
\set c2 '22222222-2222-2222-2222-222222222222'
\set e1 'eeeeeeee-1111-1111-1111-111111111111'
\set e2 'eeeeeeee-2222-2222-2222-222222222222'

insert into auth.users values (:'c1'),(:'c2'),(:'e1'),(:'e2');

create or replace function t(label text, ok boolean) returns void language plpgsql as $$
begin raise notice '% %', case when ok then 'PASS' else 'FAIL' end, label; end $$;
grant execute on function t to authenticated, anon;

-- helper: executa como usuário
create or replace function expect_error(sql text) returns boolean language plpgsql as $$
begin execute sql; return false; exception when others then return true; end $$;
grant execute on function expect_error to authenticated, anon;

set role authenticated;

-- ===== cadastro =====
select set_config('request.jwt.claim.sub', :'c1', false);
insert into profiles (id, role, full_name) values (:'c1', 'candidate', 'Ana');
insert into candidate_profiles (user_id, region, visa, english) values (:'c1', 'dublin_city', 'stamp_2', 'intermediate');
select t('candidato não cria perfil de outro usuário',
  expect_error($$insert into profiles (id, role) values ('22222222-2222-2222-2222-222222222222','candidate')$$));
select t('candidato não vira empresa', expect_error($$update profiles set role='employer'$$));
select t('candidato não cria empresa',
  expect_error($$insert into companies (owner_id, name) values ('11111111-1111-1111-1111-111111111111','X')$$));

select set_config('request.jwt.claim.sub', :'c2', false);
insert into profiles (id, role, full_name) values (:'c2', 'candidate', 'Bruno');
select t('candidato não vê perfil de outro candidato', (select count(*) from profiles) = 1);
select t('candidato não vê candidate_profile de outro', (select count(*) from candidate_profiles) = 0);

select set_config('request.jwt.claim.sub', :'e1', false);
insert into profiles (id, role, full_name) values (:'e1', 'employer', 'Café Owner');
insert into companies (id, owner_id, name, region) values ('c0000000-0000-0000-0000-000000000001', :'e1', 'Demo Café', 'dublin_city');
insert into jobs (id, source, company_id, company_name, title, region)
  values ('10000000-0000-0000-0000-000000000001','native','c0000000-0000-0000-0000-000000000001','Demo Café','Barista','dublin_city');
insert into jobs (id, source, company_id, company_name, title, region, status)
  values ('10000000-0000-0000-0000-000000000002','native','c0000000-0000-0000-0000-000000000001','Demo Café','Closed role','cork','closed');
select t('empresa não insere vaga externa (Careerjet)',
  expect_error($$insert into jobs (source, company_name, title, region, external_id, external_url) values ('careerjet','X','Y','cork','1','http://x')$$));

select set_config('request.jwt.claim.sub', :'e2', false);
insert into profiles (id, role) values (:'e2', 'employer');
select t('empresa não cria vaga para empresa de outro',
  expect_error($$insert into jobs (source, company_id, company_name, title, region) values ('native','c0000000-0000-0000-0000-000000000001','Demo','Hack','cork')$$));
update jobs set title = 'hacked' where id = '10000000-0000-0000-0000-000000000001';
select t('empresa não edita vaga de outra empresa', (select title from jobs where id='10000000-0000-0000-0000-000000000001') = 'Barista');
select t('vaga fechada de outra empresa é invisível', (select count(*) from jobs where status='closed') = 0);

-- ===== candidatura =====
select set_config('request.jwt.claim.sub', :'c1', false);
insert into applications (job_id, candidate_id) values ('10000000-0000-0000-0000-000000000001', :'c1');
select t('candidato vê a própria candidatura', (select count(*) from applications) = 1);
select t('candidato não se candidata duas vezes',
  expect_error($$insert into applications (job_id, candidate_id) values ('10000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111')$$));
select t('candidato não se candidata em nome de outro',
  expect_error($$insert into applications (job_id, candidate_id) values ('10000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222')$$));
select t('candidato não se inscreve já como "hired"',
  expect_error($$insert into applications (job_id, candidate_id, status) values ('10000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','hired')$$));
update applications set status = 'hired';
select t('candidato não muda o próprio status', (select status from applications) = 'applied');

select set_config('request.jwt.claim.sub', :'c2', false);
select t('candidato não vê candidatura de outro', (select count(*) from applications) = 0);
select t('não aceita candidatura em vaga fechada',
  expect_error($$insert into applications (job_id, candidate_id) values ('10000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222')$$));

select set_config('request.jwt.claim.sub', :'e2', false);
select t('outra empresa não vê candidaturas', (select count(*) from applications) = 0);
update applications set status = 'rejected';

select set_config('request.jwt.claim.sub', :'e1', false);
select t('empresa dona vê a candidatura', (select count(*) from applications) = 1);
select t('empresa vê nome do candidato', (select full_name from profiles where id = '11111111-1111-1111-1111-111111111111') = 'Ana');
select t('empresa vê detalhes do candidato', (select visa::text from candidate_profiles) = 'stamp_2');
select t('empresa não vê candidato que não se aplicou', (select count(*) from profiles where id='22222222-2222-2222-2222-222222222222') = 0);
select t('outra empresa não alterou status', (select status from applications) = 'applied');
update applications set status = 'interview';
select t('empresa dona muda status', (select status from applications) = 'interview');
select t('empresa não troca o candidato da candidatura',
  expect_error($$update applications set candidate_id='22222222-2222-2222-2222-222222222222'$$));

-- ===== visitante =====
reset role; set role anon;
select set_config('request.jwt.claim.sub', '', false);
select t('visitante vê vagas abertas', (select count(*) from jobs where not is_demo) = 1);
select t('visitante não vê candidaturas', (select count(*) from applications) = 0);

-- ===== servidor (importação Careerjet) =====
reset role;
insert into jobs (source, company_name, title, region, external_id, external_url)
  values ('careerjet','Some Hotel','Room attendant','limerick','cj-1','https://www.careerjet.ie/x');
select t('servidor importa vaga externa', (select count(*) from jobs where source='careerjet') = 1);
select t('vaga externa sem link é rejeitada',
  expect_error($$insert into jobs (source, company_name, title, region, external_id) values ('careerjet','X','Y','cork','cj-2')$$));
select t('não duplica vaga externa',
  expect_error($$insert into jobs (source, company_name, title, region, external_id, external_url) values ('careerjet','X','Y','cork','cj-1','https://a')$$));
select t('visto padrão é "não informado"', (select visa_info::text from jobs where external_id='cj-1') = 'not_informed');
set role authenticated;
select set_config('request.jwt.claim.sub', :'c1', false);
select t('não aceita candidatura interna em vaga externa',
  expect_error($$insert into applications (job_id, candidate_id) select id, '11111111-1111-1111-1111-111111111111' from jobs where source='careerjet'$$));
