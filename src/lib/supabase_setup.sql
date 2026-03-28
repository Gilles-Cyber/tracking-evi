-- Evri Supabase setup (idempotent)
-- Run this in Supabase SQL Editor.
-- This script is safe to run multiple times.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Core tables
-- -----------------------------------------------------------------------------

create table if not exists public.shipments (
  id text primary key,
  session_id text,
  origin text,
  dest text,
  date text,
  status text default 'Pending',
  value text,
  driver text,
  progress numeric default 0,
  vehicle_type text default 'ground',
  admin_message text,
  animation_speed integer default 15,
  weight numeric,
  dimensions text,
  cargo_type text,
  priority text default 'Standard',
  hazardous boolean default false,
  estimated_arrival date,
  sender_name text,
  sender_email text,
  sender_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipments alter column id type text using id::text;
alter table public.shipments alter column id set not null;
alter table public.shipments add column if not exists session_id text;
alter table public.shipments add column if not exists origin text;
alter table public.shipments add column if not exists dest text;
alter table public.shipments add column if not exists date text;
alter table public.shipments add column if not exists status text default 'Pending';
alter table public.shipments add column if not exists value text;
alter table public.shipments add column if not exists driver text;
alter table public.shipments add column if not exists progress numeric default 0;
alter table public.shipments add column if not exists vehicle_type text default 'ground';
alter table public.shipments add column if not exists admin_message text;
alter table public.shipments add column if not exists animation_speed integer default 15;
alter table public.shipments add column if not exists weight numeric;
alter table public.shipments add column if not exists dimensions text;
alter table public.shipments add column if not exists cargo_type text;
alter table public.shipments add column if not exists priority text default 'Standard';
alter table public.shipments add column if not exists hazardous boolean default false;
alter table public.shipments add column if not exists estimated_arrival date;
alter table public.shipments add column if not exists sender_name text;
alter table public.shipments add column if not exists sender_email text;
alter table public.shipments add column if not exists sender_phone text;
alter table public.shipments add column if not exists created_at timestamptz not null default now();
alter table public.shipments add column if not exists updated_at timestamptz not null default now();

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  name text,
  email text,
  phone text,
  photo_url text,
  last_active timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists session_id text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists photo_url text;
alter table public.profiles add column if not exists last_active timestamptz default now();
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create unique index if not exists profiles_session_id_key on public.profiles(session_id);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  text text not null,
  sender_type text not null default 'user',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_messages add column if not exists session_id text;
alter table public.support_messages add column if not exists text text;
alter table public.support_messages add column if not exists sender_type text default 'user';
alter table public.support_messages add column if not exists is_read boolean not null default false;
alter table public.support_messages add column if not exists created_at timestamptz not null default now();
alter table public.support_messages add column if not exists updated_at timestamptz not null default now();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'info',
  title text not null default 'Notification',
  message text not null default '',
  is_read boolean not null default false,
  shipment_id text,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notifications add column if not exists type text not null default 'info';
alter table public.notifications add column if not exists title text not null default 'Notification';
alter table public.notifications add column if not exists message text not null default '';
alter table public.notifications add column if not exists is_read boolean not null default false;
alter table public.notifications add column if not exists shipment_id text;
alter table public.notifications add column if not exists session_id text;
alter table public.notifications add column if not exists created_at timestamptz not null default now();
alter table public.notifications add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_shipment_id_fkey'
  ) then
    alter table public.notifications
      add constraint notifications_shipment_id_fkey
      foreign key (shipment_id) references public.shipments(id) on delete set null;
  end if;
end $$;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  shipment_id text,
  title text,
  type text,
  file_url text,
  size_bytes bigint,
  uploaded_by_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents add column if not exists shipment_id text;
alter table public.documents add column if not exists title text;
alter table public.documents add column if not exists type text;
alter table public.documents add column if not exists file_url text;
alter table public.documents add column if not exists size_bytes bigint;
alter table public.documents add column if not exists uploaded_by_session_id text;
alter table public.documents add column if not exists created_at timestamptz not null default now();
alter table public.documents add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'documents_shipment_id_fkey'
  ) then
    alter table public.documents
      add constraint documents_shipment_id_fkey
      foreign key (shipment_id) references public.shipments(id) on delete cascade;
  end if;
end $$;

create table if not exists public.system_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'System Alert',
  message text not null default '',
  severity text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.system_alerts add column if not exists title text not null default 'System Alert';
alter table public.system_alerts add column if not exists message text not null default '';
alter table public.system_alerts add column if not exists severity text not null default 'info';
alter table public.system_alerts add column if not exists is_read boolean not null default false;
alter table public.system_alerts add column if not exists created_at timestamptz not null default now();

-- -----------------------------------------------------------------------------
-- Data quality constraints
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'shipments_progress_range_check') then
    alter table public.shipments
      add constraint shipments_progress_range_check check (progress >= 0 and progress <= 100);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'shipments_vehicle_type_check') then
    alter table public.shipments
      add constraint shipments_vehicle_type_check check (vehicle_type in ('ground', 'air', 'sea'));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'shipments_priority_check') then
    alter table public.shipments
      add constraint shipments_priority_check check (priority in ('Standard', 'Priority', 'Critical'));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'support_messages_sender_type_check') then
    alter table public.support_messages
      add constraint support_messages_sender_type_check check (sender_type in ('user', 'admin'));
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists shipments_session_id_idx on public.shipments(session_id);
create index if not exists shipments_status_idx on public.shipments(status);
create index if not exists shipments_created_at_idx on public.shipments(created_at desc);

create index if not exists support_messages_session_created_idx on public.support_messages(session_id, created_at);
create index if not exists support_messages_unread_idx on public.support_messages(is_read, sender_type, session_id);

create index if not exists notifications_is_read_created_idx on public.notifications(is_read, created_at desc);
create index if not exists documents_shipment_id_idx on public.documents(shipment_id);

-- -----------------------------------------------------------------------------
-- Updated-at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_shipments_updated_at on public.shipments;
create trigger trg_shipments_updated_at
before update on public.shipments
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_support_messages_updated_at on public.support_messages;
create trigger trg_support_messages_updated_at
before update on public.support_messages
for each row execute function public.set_updated_at();

drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Optional app alerts trigger (keeps admin alerts table populated)
-- -----------------------------------------------------------------------------

create or replace function public.gxn_notify_on_shipment_update()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if new.status in ('Alert', 'Delayed', 'Spoiled', 'Customs Hold') then
      insert into public.notifications(type, title, message, shipment_id, is_read)
      values (
        'critical',
        'Shipment status changed',
        'Shipment ' || new.id || ' changed from ' || coalesce(old.status, 'N/A') || ' to ' || new.status,
        new.id,
        false
      );
    else
      insert into public.notifications(type, title, message, shipment_id, is_read)
      values (
        'info',
        'Shipment updated',
        'Shipment ' || new.id || ' changed from ' || coalesce(old.status, 'N/A') || ' to ' || new.status,
        new.id,
        false
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_gxn_notify_shipment_update on public.shipments;
create trigger trg_gxn_notify_shipment_update
after update on public.shipments
for each row execute function public.gxn_notify_on_shipment_update();

create or replace function public.gxn_notify_on_user_message()
returns trigger
language plpgsql
as $$
begin
  if new.sender_type = 'user' then
    insert into public.notifications(type, title, message, session_id, is_read)
    values (
      'info',
      'New support message',
      left(new.text, 180),
      new.session_id,
      false
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_gxn_notify_user_message on public.support_messages;
create trigger trg_gxn_notify_user_message
after insert on public.support_messages
for each row execute function public.gxn_notify_on_user_message();

-- -----------------------------------------------------------------------------
-- Row Level Security (app uses anon key + local session_id, no Supabase Auth yet)
-- -----------------------------------------------------------------------------

alter table public.shipments enable row level security;
alter table public.profiles enable row level security;
alter table public.support_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.documents enable row level security;
alter table public.system_alerts enable row level security;

drop policy if exists gxn_open_all_shipments on public.shipments;
create policy gxn_open_all_shipments
on public.shipments
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists gxn_open_all_profiles on public.profiles;
create policy gxn_open_all_profiles
on public.profiles
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists gxn_open_all_support_messages on public.support_messages;
create policy gxn_open_all_support_messages
on public.support_messages
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists gxn_open_all_notifications on public.notifications;
create policy gxn_open_all_notifications
on public.notifications
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists gxn_open_all_documents on public.documents;
create policy gxn_open_all_documents
on public.documents
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists gxn_open_all_system_alerts on public.system_alerts;
create policy gxn_open_all_system_alerts
on public.system_alerts
for all
to anon, authenticated
using (true)
with check (true);

-- -----------------------------------------------------------------------------
-- Storage bucket for profile photos
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists gxn_profile_photos_select on storage.objects;
create policy gxn_profile_photos_select
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'profile-photos');

drop policy if exists gxn_profile_photos_insert on storage.objects;
create policy gxn_profile_photos_insert
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'profile-photos');

drop policy if exists gxn_profile_photos_update on storage.objects;
create policy gxn_profile_photos_update
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'profile-photos')
with check (bucket_id = 'profile-photos');

drop policy if exists gxn_profile_photos_delete on storage.objects;
create policy gxn_profile_photos_delete
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'profile-photos');

-- -----------------------------------------------------------------------------
-- Realtime publication
-- -----------------------------------------------------------------------------

alter table public.shipments replica identity full;
alter table public.support_messages replica identity full;
alter table public.notifications replica identity full;
alter table public.profiles replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shipments'
    ) then
      execute 'alter publication supabase_realtime add table public.shipments';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_messages'
    ) then
      execute 'alter publication supabase_realtime add table public.support_messages';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      execute 'alter publication supabase_realtime add table public.notifications';
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
    ) then
      execute 'alter publication supabase_realtime add table public.profiles';
    end if;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Optional seed for quick UI checks (safe: only inserts when shipments is empty)
-- -----------------------------------------------------------------------------

insert into public.shipments (
  id, session_id, origin, dest, date, status, value, driver, progress, vehicle_type,
  admin_message, animation_speed, weight, dimensions, cargo_type, priority, hazardous,
  estimated_arrival, sender_name, sender_email, sender_phone
)
select
  'EVR-DEMO-001',
  'sess_demo_user',
  'Paris, FR',
  'Lyon, FR',
  to_char(now()::date + interval '2 day', 'DD Mon YYYY'),
  'Transit',
  'EUR 24,500',
  'Sophie M.',
  62,
  'ground',
  'Customs checkpoint cleared. Delivery on schedule.',
  20,
  145.5,
  '120x80x100',
  'Electronics',
  'Priority',
  false,
  now()::date + interval '2 day',
  'Demo Client',
  'demo@example.com',
  '+33 6 00 00 00 00'
where not exists (select 1 from public.shipments);
