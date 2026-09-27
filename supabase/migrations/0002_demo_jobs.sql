-- =====================================================================
-- Job Match — Fase 3: vagas de demonstração
-- Empresas de demonstração não têm dono (não há usuário real por trás).
-- Todos os salários de demonstração respeitam o salário mínimo irlandês
-- de 2026 (€14.15/h para 20+ anos — citizensinformation.ie).
-- =====================================================================

alter table companies alter column owner_id drop not null;
alter table companies drop constraint if exists company_owner_or_demo;
alter table companies add constraint company_owner_or_demo check (owner_id is not null or is_demo);

-- Horas por semana (ajuda no match com Stamp 2: 20h em aulas / 40h em férias). null = não informado
alter table jobs add column if not exists hours_per_week integer check (hours_per_week between 1 and 60);

-- Busca por texto no título e na empresa
create index if not exists jobs_title_idx on jobs using gin (to_tsvector('simple', title || ' ' || company_name));

-- ---------- Dados de demonstração (idempotente: apaga e recria) ----------
delete from jobs where is_demo;
delete from companies where is_demo;

insert into companies (id, owner_id, name, region, description, is_demo) values
 ('d0000000-0000-0000-0000-000000000001', null, 'Example Café', 'dublin_city', 'Demo business used to show how Job Match works.', true),
 ('d0000000-0000-0000-0000-000000000002', null, 'Example Hotel', 'dublin_city', 'Demo business used to show how Job Match works.', true),
 ('d0000000-0000-0000-0000-000000000003', null, 'Example Logistics', 'dublin_county', 'Demo business used to show how Job Match works.', true),
 ('d0000000-0000-0000-0000-000000000004', null, 'Example Foods', 'cork', 'Demo business used to show how Job Match works.', true),
 ('d0000000-0000-0000-0000-000000000005', null, 'Example Retail', 'limerick', 'Demo business used to show how Job Match works.', true),
 ('d0000000-0000-0000-0000-000000000006', null, 'Example Cleaning Co.', 'cork', 'Demo business used to show how Job Match works.', true);

insert into jobs (source, company_id, company_name, title, description, requirements, region, area,
                  employment_type, shifts, hours_per_week, salary_min, salary_max, salary_period,
                  visa_info, english_required, requires_ppsn, is_demo, posted_at) values
 ('native','d0000000-0000-0000-0000-000000000001','Example Café','Barista',
  'Prepare coffee and serve customers in a busy city-centre café. Training on the machine is provided.',
  'Friendly attitude. Coffee experience is a plus, not required.',
  'dublin_city','hospitality','part_time','{weekend,morning}',20,14.50,null,'hour',
  'stamp_2_ok','intermediate',false,true, now() - interval '1 day'),

 ('native','d0000000-0000-0000-0000-000000000002','Example Hotel','Room Attendant',
  'Clean and prepare guest rooms to hotel standard. Uniform and meals on shift provided.',
  'Attention to detail. Able to work weekends.',
  'dublin_city','cleaning','part_time','{morning,weekend}',20,14.80,null,'hour',
  'stamp_2_ok','basic',null,true, now() - interval '2 days'),

 ('native','d0000000-0000-0000-0000-000000000002','Example Hotel','Night Porter',
  'Welcome late guests, handle check-ins and keep the lobby safe overnight.',
  'Good spoken English for talking with guests. Previous hotel work preferred.',
  'dublin_city','hospitality','full_time','{night}',39,15.50,16.50,'hour',
  'work_permit_required','advanced',true,true, now() - interval '3 days'),

 ('native','d0000000-0000-0000-0000-000000000003','Example Logistics','Warehouse Operative',
  'Pick and pack orders in a warehouse near Dublin Airport. Shuttle bus from the city at shift start.',
  'Able to stand for long periods. Safety shoes required (we can advise where to buy).',
  'dublin_county','warehouse','both','{evening,night}',null,15.00,null,'hour',
  'stamp_2_ok','basic',true,true, now() - interval '1 day'),

 ('native','d0000000-0000-0000-0000-000000000003','Example Logistics','Delivery Helper',
  'Help the driver load and deliver parcels around south Dublin.',
  null,
  'dublin_county','delivery','part_time','{morning,afternoon}',16,null,null,null,
  'not_informed',null,null,true, now() - interval '5 days'),

 ('native','d0000000-0000-0000-0000-000000000004','Example Foods','Food Production Operative',
  'Work on a food packing line. Hairnet and uniform provided. Hygiene training on day one.',
  'No experience needed.',
  'cork','food_production','both','{morning,afternoon}',null,14.60,null,'hour',
  'stamp_2_ok','basic',false,true, now() - interval '2 days'),

 ('native','d0000000-0000-0000-0000-000000000004','Example Foods','Kitchen Porter',
  'Wash up and keep the kitchen clean in a staff canteen.',
  null,
  'cork','hospitality','part_time','{afternoon,evening}',15,null,null,null,
  'stamp_2_ok',null,null,true, now() - interval '6 days'),

 ('native','d0000000-0000-0000-0000-000000000005','Example Retail','Retail Assistant',
  'Serve customers, stock shelves and use the till in a city-centre shop.',
  'Comfortable talking with customers in English.',
  'limerick','retail','part_time','{afternoon,weekend}',18,14.40,null,'hour',
  'stamp_2_ok','intermediate',false,true, now() - interval '1 day'),

 ('native','d0000000-0000-0000-0000-000000000005','Example Retail','Stock Assistant (night)',
  'Refill shelves overnight while the shop is closed.',
  null,
  'limerick','retail','full_time','{night}',39,null,null,null,
  'eu_only','basic',true,true, now() - interval '4 days'),

 ('native','d0000000-0000-0000-0000-000000000006','Example Cleaning Co.','Office Cleaner',
  'Evening cleaning of offices in Cork city. Short shifts, same building every day.',
  null,
  'cork','cleaning','part_time','{evening}',12,14.30,null,'hour',
  'stamp_2_ok','basic',null,true, now() - interval '2 days');
