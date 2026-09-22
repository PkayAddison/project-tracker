-- Roles ---------------------------------------------------------------
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Only this email may hold the administrator role.
create or replace function public.claim_owner_admin()
returns boolean language plpgsql security definer set search_path = public as $$
declare
  mail text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if auth.uid() is null or mail <> 'paakwesi.phbis@gmail.com' then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict (user_id, role) do nothing;
  return true;
end;
$$;
grant execute on function public.claim_owner_admin() to authenticated;

-- Data tables ---------------------------------------------------------
create table public.committees (
  id text primary key,
  name text not null,
  description text not null default ''
);

create table public.members (
  id text primary key,
  name text not null,
  email text not null default '',
  role text not null default '',
  committee_id text not null default '',
  is_admin boolean not null default false
);

create table public.projects (
  id text primary key,
  name text not null,
  description text not null default '',
  objective text not null default '',
  lead_id text not null default '',
  committee_id text not null default '',
  member_ids text[] not null default '{}',
  start_date text not null default '',
  target_date text not null default '',
  priority text not null default 'Medium',
  status text not null default 'Planning',
  created_at text not null default ''
);

create table public.tasks (
  id text primary key,
  title text not null,
  description text not null default '',
  project_id text not null default '',
  assignee_id text not null default '',
  support_ids text[] not null default '{}',
  start_date text not null default '',
  due_date text not null default '',
  priority text not null default 'Medium',
  status text not null default 'Not Started',
  percent_complete integer not null default 0,
  challenges text not null default '',
  next_action text not null default '',
  next_review_date text not null default '',
  created_at text not null default ''
);

create table public.progress_updates (
  id text primary key,
  task_id text not null default '',
  author_id text not null default '',
  created_at text not null default '',
  status text not null default 'In Progress',
  percent_complete integer not null default 0,
  progress_made text not null default '',
  challenges text not null default '',
  support_required text not null default '',
  next_action text not null default '',
  expected_date text not null default '',
  next_update_date text not null default ''
);

create table public.audit_log (
  id text primary key,
  created_at text not null default '',
  entity text not null default '',
  entity_id text not null default '',
  project_id text not null default '',
  message text not null default ''
);

create table public.org_settings (
  id integer primary key default 1 check (id = 1),
  name text not null default '',
  logo text not null default '',
  address text not null default '',
  email text not null default '',
  phone text not null default '',
  report_footer text not null default ''
);

-- Grants + RLS: everyone reads, only the administrator writes ----------
do $$
declare t text;
begin
  foreach t in array array['committees','members','projects','tasks','progress_updates','audit_log','org_settings'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(), ''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(), ''admin''))', t);
  end loop;
end $$;

-- Demo data -----------------------------------------------------------
create or replace function public.seed_demo_data()
returns void language plpgsql security definer set search_path = public as $$
declare
  d0 date := current_date;
begin
  delete from public.audit_log;
  delete from public.progress_updates;
  delete from public.tasks;
  delete from public.projects;
  delete from public.members;
  delete from public.committees;
  delete from public.org_settings;

  insert into public.committees (id, name, description) values
    ('c1','ICT','Technology, systems and infrastructure'),
    ('c2','Academic','Curriculum and learning outcomes'),
    ('c3','Events','Planning and running organisational events'),
    ('c4','Administration','Operations, finance and facilities'),
    ('c5','Marketing','Communications, brand and outreach');

  insert into public.members (id, name, email, role, committee_id) values
    ('m1','Ama Boateng','ama.boateng@org.edu','ICT Lead','c1'),
    ('m2','Kwesi Mensah','kwesi.mensah@org.edu','Web Developer','c1'),
    ('m3','Adjoa Owusu','adjoa.owusu@org.edu','Academic Coordinator','c2'),
    ('m4','Yaw Darko','yaw.darko@org.edu','Events Manager','c3'),
    ('m5','Efua Asante','efua.asante@org.edu','Administrator','c4'),
    ('m6','Kojo Appiah','kojo.appiah@org.edu','Marketing Officer','c5'),
    ('m7','Nana Adjei','nana.adjei@org.edu','Network Engineer','c1'),
    ('m8','Akosua Frimpong','akosua.frimpong@org.edu','Teacher','c2');

  insert into public.projects (id,name,description,objective,lead_id,committee_id,member_ids,start_date,target_date,priority,status,created_at) values
    ('p1','Website Development','Design and launch the new public website with admissions portal.','Deliver a modern, mobile-first website that increases enquiries by 40%.','m1','c1',array['m1','m2','m6'],(d0-60)::text,(d0+12)::text,'High','In Progress',(now()-interval '60 days')::text),
    ('p2','School Events Planning','Calendar of termly events including speech day and open house.','Run four flagship events with 90%+ attendance satisfaction.','m4','c3',array['m4','m5','m6'],(d0-30)::text,(d0+45)::text,'Medium','In Progress',(now()-interval '30 days')::text),
    ('p3','ICT Infrastructure Upgrade','Campus-wide network refresh, new switches and Wi-Fi coverage.','Achieve 99.5% uptime and full campus Wi-Fi coverage.','m7','c1',array['m7','m1','m5'],(d0-90)::text,(d0-5)::text,'High','On Hold',(now()-interval '90 days')::text),
    ('p4','Academic Improvement Initiative','Teacher training and assessment redesign programme.','Raise average core subject pass rate by 15%.','m3','c2',array['m3','m8'],(d0-120)::text,(d0-20)::text,'Medium','Completed',(now()-interval '120 days')::text);

  insert into public.tasks (id,title,description,project_id,assignee_id,support_ids,start_date,due_date,priority,status,percent_complete,challenges,next_action,next_review_date,created_at) values
    ('t1','Finalise homepage design','Approve visual direction and hero content for the homepage.','p1','m2',array['m6'],(d0-40)::text,(d0-6)::text,'High','In Progress',70,'Waiting on final photography from marketing.','Collect approved images and publish design',(d0+2)::text,(now()-interval '40 days')::text),
    ('t2','Build admissions form','Multi-step application form with validation and email receipt.','p1','m2',array['m1'],(d0-20)::text,(d0+8)::text,'High','In Progress',45,'','Wire up confirmation emails',(d0+3)::text,(now()-interval '20 days')::text),
    ('t3','Content migration','Move all legacy pages and news posts to the new site.','p1','m6',array[]::text[],(d0-10)::text,(d0-2)::text,'Medium','Not Started',0,'Legacy CMS export keeps failing.','Request database dump from old host',(d0+1)::text,(now()-interval '10 days')::text),
    ('t4','Speech day programme','Draft running order, invite guest speaker and confirm awards.','p2','m4',array['m5'],(d0-15)::text,(d0+14)::text,'Medium','In Progress',55,'','Confirm guest speaker availability',(d0+5)::text,(now()-interval '15 days')::text),
    ('t5','Open house logistics','Venue setup, signage, refreshments and volunteer roster.','p2','m5',array['m4'],(d0-5)::text,(d0+25)::text,'Low','Not Started',0,'','Book the main hall',(d0+7)::text,(now()-interval '5 days')::text),
    ('t6','Replace core switches','Install and configure new core network switches.','p3','m7',array['m1'],(d0-70)::text,(d0-12)::text,'High','On Hold',30,'Procurement delay on hardware delivery.','Escalate purchase order with supplier',(d0+4)::text,(now()-interval '70 days')::text),
    ('t7','Wi-Fi survey of blocks A-D','Heat-map survey and access point placement plan.','p3','m1',array['m7'],(d0-60)::text,(d0-30)::text,'Medium','Completed',100,'','','',(now()-interval '60 days')::text),
    ('t8','Teacher training workshops','Three workshops on formative assessment techniques.','p4','m3',array['m8'],(d0-110)::text,(d0-40)::text,'Medium','Completed',100,'','','',(now()-interval '110 days')::text),
    ('t9','Assessment redesign rollout','Publish new assessment rubrics across core subjects.','p4','m8',array['m3'],(d0-80)::text,(d0-25)::text,'Low','Completed',100,'','','',(now()-interval '80 days')::text);

  insert into public.progress_updates (id,task_id,author_id,created_at,status,percent_complete,progress_made,challenges,support_required,next_action,expected_date,next_update_date) values
    ('u1','t1','m2',(now()-interval '3 days')::text,'In Progress',70,'Hero section and navigation approved by the ICT lead.','Still waiting on final photography.','Marketing to share approved image set.','Publish the approved design to staging',(d0+3)::text,(d0+2)::text),
    ('u2','t6','m7',(now()-interval '2 days')::text,'On Hold',30,'Rack space prepared and cabling labelled.','Hardware delivery delayed by four weeks.','Admin to escalate the purchase order.','Follow up with supplier',(d0+20)::text,(d0+4)::text),
    ('u3','t4','m4',(now()-interval '1 days')::text,'In Progress',55,'Draft running order circulated to the events committee.','','','Confirm guest speaker',(d0+10)::text,(d0+5)::text);

  insert into public.audit_log (id,created_at,entity,entity_id,project_id,message) values
    ('a1',(now()-interval '3 days')::text,'task','t1','p1','Progress update submitted by Kwesi Mensah (70%)'),
    ('a2',(now()-interval '2 days')::text,'task','t6','p3','Progress update submitted by Nana Adjei (30%)');

  insert into public.org_settings (id,name,logo,address,email,phone,report_footer) values
    (1,'PHBIS Tech & Media','','12 Independence Avenue, Accra','info@greenhill.edu','+233 30 123 4567','Confidential — prepared by the Project Management Office.');
end;
$$;
revoke all on function public.seed_demo_data() from public, anon, authenticated;

create or replace function public.reset_sample_data()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only the administrator can reset sample data';
  end if;
  perform public.seed_demo_data();
end;
$$;
grant execute on function public.reset_sample_data() to authenticated;

select public.seed_demo_data();
