-- ─────────────────────────────────────────────────────────────────────────────
-- Ceyteq General Management System — Phase 1 schema (0001_init)
--
-- Tables:  departments (nested), profiles (1:1 with auth.users), audit_logs
-- Roles:   super_master_admin > department_head > manager > employee
-- RLS:     enabled on every table. Super admin = full access; department
--          heads = their department subtree; everyone else = own records.
--
-- Run in the Supabase SQL editor, or `supabase db push`. Idempotent —
-- safe to run more than once.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum (
    'super_master_admin', 'department_head', 'manager', 'employee'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_status as enum ('active', 'invited', 'suspended', 'disabled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.department_status as enum ('active', 'archived');
exception when duplicate_object then null; end $$;

-- ── Departments (parent_id allows unlimited nesting) ────────────────────────
create table if not exists public.departments (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  parent_id    uuid references public.departments (id) on delete set null,
  head_user_id uuid, -- FK to profiles added below (profiles must exist first)
  status       public.department_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint departments_not_own_parent check (parent_id is null or parent_id <> id)
);

create index if not exists departments_parent_id_idx on public.departments (parent_id);

-- ── Profiles (one row per auth.users record) ────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null unique,
  full_name     text not null default '',
  role          public.user_role not null default 'employee',
  department_id uuid references public.departments (id) on delete set null,
  manager_id    uuid references public.profiles (id) on delete set null,
  status        public.user_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_not_own_manager check (manager_id is null or manager_id <> id)
);

create index if not exists profiles_department_id_idx on public.profiles (department_id);
create index if not exists profiles_manager_id_idx on public.profiles (manager_id);
create index if not exists profiles_role_idx on public.profiles (role);

do $$ begin
  alter table public.departments
    add constraint departments_head_user_id_fkey
    foreign key (head_user_id) references public.profiles (id) on delete set null;
exception when duplicate_object then null; end $$;

-- ── Audit logs (IPs stored hashed, never raw) ───────────────────────────────
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  email      text,
  action     text not null,
  ip_hash    text,
  user_agent text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists audit_logs_action_idx on public.audit_logs (action);

-- ── updated_at automation ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Role / subtree helpers (SECURITY DEFINER → no RLS recursion) ────────────
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.current_department_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select department_id from public.profiles where id = auth.uid() $$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_user_role() = 'super_master_admin', false) $$;

-- A department plus every descendant below it.
create or replace function public.department_subtree(root uuid)
returns setof uuid
language sql stable security definer set search_path = public
as $$
  with recursive sub as (
    select id from public.departments where id = root
    union all
    select d.id from public.departments d join sub on d.parent_id = sub.id
  )
  select id from sub
$$;

-- Can the current user reach this department at all?
create or replace function public.can_access_department(dept uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select case
    when dept is null then false
    when public.is_super_admin() then true
    when public.current_user_role() = 'department_head'
      then dept in (select public.department_subtree(public.current_department_id()))
    else dept = public.current_department_id()
  end
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.departments enable row level security;
alter table public.audit_logs  enable row level security;

-- profiles: read own + same department (+ subtree for heads) + all for admin
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    public.is_super_admin()
    or id = auth.uid()
    or public.can_access_department(department_id)
  );

-- profiles: insert via trigger/seed only (service role); admins may create
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (public.is_super_admin());

-- profiles: update own row; heads manage their subtree; admin manages all
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (
    public.is_super_admin()
    or id = auth.uid()
    or (
      public.current_user_role() = 'department_head'
      and department_id in (select public.department_subtree(public.current_department_id()))
    )
  )
  with check (
    public.is_super_admin()
    or id = auth.uid()
    or (
      public.current_user_role() = 'department_head'
      and department_id in (select public.department_subtree(public.current_department_id()))
    )
  );

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated
  using (public.is_super_admin());

-- departments: readable where reachable; writes for admin + subtree heads
drop policy if exists departments_select on public.departments;
create policy departments_select on public.departments
  for select to authenticated
  using (public.is_super_admin() or public.can_access_department(id));

drop policy if exists departments_insert on public.departments;
create policy departments_insert on public.departments
  for insert to authenticated
  with check (
    public.is_super_admin()
    or (
      public.current_user_role() = 'department_head'
      and (parent_id is null or public.can_access_department(parent_id))
    )
  );

drop policy if exists departments_update on public.departments;
create policy departments_update on public.departments
  for update to authenticated
  using (
    public.is_super_admin()
    or (public.current_user_role() = 'department_head' and public.can_access_department(id))
  )
  with check (
    public.is_super_admin()
    or (public.current_user_role() = 'department_head' and public.can_access_department(id))
  );

drop policy if exists departments_delete on public.departments;
create policy departments_delete on public.departments
  for delete to authenticated
  using (
    public.is_super_admin()
    or (public.current_user_role() = 'department_head' and public.can_access_department(id))
  );

-- audit_logs: read own events (admin reads all); inserts only via service role
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.is_super_admin() or user_id = auth.uid());

-- (No insert/update/delete policies for audit_logs — only the service-role
-- server key, which bypasses RLS, may write audit entries.)

-- ── Table privileges (RLS still applies on top) ─────────────────────────────
grant select, insert, update, delete on public.profiles    to authenticated;
grant select, insert, update, delete on public.departments to authenticated;
grant select on public.audit_logs to authenticated;
grant all on public.profiles, public.departments, public.audit_logs to service_role;

-- ── Auto-create a profile for every new auth user ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    'employee',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on table public.profiles    is 'Ceyteq people — 1:1 with auth.users. role hierarchy: super_master_admin > department_head > manager > employee.';
comment on table public.departments is 'Nested organisation units (parent_id → unlimited depth).';
comment on table public.audit_logs  is 'Security audit trail. ip_hash is HMAC-SHA256 of the client IP; raw IPs are never stored.';
