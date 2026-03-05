-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── Barbers ────────────────────────────────────────────────────────────────
create table if not exists barbers (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  active bool not null default true
);

-- ─── Services ───────────────────────────────────────────────────────────────
create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  duration_minutes int  not null check (duration_minutes > 0),
  price_cents      int  null check (price_cents >= 0),
  active           bool not null default true
);

-- ─── Business Hours ─────────────────────────────────────────────────────────
-- Convention: a row where open_time = close_time (e.g. '00:00' = '00:00') means
-- the shop is closed that day. This is enforced by application logic; the DB
-- stores the raw values to allow flexible "closed day" representation.
create table if not exists business_hours (
  day_of_week           int  primary key check (day_of_week between 0 and 6),
  open_time             time not null,
  close_time            time not null,
  slot_interval_minutes int  not null default 15,
  buffer_minutes        int  not null default 5
);

-- ─── Barber Hours ────────────────────────────────────────────────────────────
create table if not exists barber_hours (
  barber_id   uuid references barbers(id) on delete cascade,
  day_of_week int  check (day_of_week between 0 and 6),
  open_time   time not null,
  close_time  time not null,
  primary key (barber_id, day_of_week)
);

-- ─── Time Off ────────────────────────────────────────────────────────────────
create table if not exists time_off (
  id         uuid      primary key default gen_random_uuid(),
  barber_id  uuid      null references barbers(id) on delete cascade,
  start_ts   timestamptz not null,
  end_ts     timestamptz not null,
  reason     text not null default '',
  check (end_ts > start_ts)
);

create index if not exists time_off_start_idx on time_off(start_ts);

-- ─── Bookings ─────────────────────────────────────────────────────────────
create table if not exists bookings (
  id             uuid        primary key default gen_random_uuid(),
  barber_id      uuid        not null references barbers(id),
  service_id     uuid        not null references services(id),
  customer_name  text        not null,
  customer_email text        not null,
  customer_phone text        null,
  start_ts       timestamptz not null,
  end_ts         timestamptz not null,
  status         text        not null default 'confirmed'
                             check (status in ('confirmed','cancelled')),
  manage_token   text        not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at     timestamptz not null default now(),
  check (end_ts > start_ts)
);

create index if not exists bookings_barber_start_idx on bookings(barber_id, start_ts);
create index if not exists bookings_token_idx on bookings(manage_token);

-- ─── Seed: default business hours (Mon–Sat 9am–7pm, closed Sun) ─────────────
insert into business_hours (day_of_week, open_time, close_time, slot_interval_minutes, buffer_minutes)
values
  (0, '00:00', '00:00', 15, 5),  -- Sunday (closed – same open/close signals closed)
  (1, '09:00', '19:00', 15, 5),  -- Monday
  (2, '09:00', '19:00', 15, 5),  -- Tuesday
  (3, '09:00', '19:00', 15, 5),  -- Wednesday
  (4, '09:00', '19:00', 15, 5),  -- Thursday
  (5, '09:00', '19:00', 15, 5),  -- Friday
  (6, '09:00', '17:00', 15, 5)   -- Saturday
on conflict (day_of_week) do nothing;

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table barbers        enable row level security;
alter table services       enable row level security;
alter table business_hours enable row level security;
alter table barber_hours   enable row level security;
alter table time_off       enable row level security;
alter table bookings       enable row level security;

-- Public read: barbers/services/hours/time_off (active only where applicable)
create policy "public_read_barbers"
  on barbers for select using (active = true);

create policy "public_read_services"
  on services for select using (active = true);

create policy "public_read_business_hours"
  on business_hours for select using (true);

create policy "public_read_barber_hours"
  on barber_hours for select using (true);

create policy "public_read_time_off"
  on time_off for select using (true);

-- Bookings: no direct public read (reads go through edge functions or manage_token)
-- Edge functions use service_role key, so they bypass RLS.
-- Allow reading a booking only if manage_token matches (for ManageBooking page using anon key)
create policy "read_booking_by_token"
  on bookings for select
  using (manage_token = current_setting('request.jwt.claims', true)::json->>'manage_token' or
         auth.role() = 'service_role' or auth.role() = 'authenticated');

-- Admin full access (authenticated users)
create policy "admin_all_barbers"        on barbers        for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_services"       on services       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_business_hours" on business_hours for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_barber_hours"   on barber_hours   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_time_off"       on time_off       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_bookings"       on bookings       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
