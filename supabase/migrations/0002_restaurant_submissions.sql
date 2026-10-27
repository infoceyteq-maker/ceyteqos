-- ─────────────────────────────────────────────────────────────────────────────
-- Ceyteq General Management System — 0002_restaurant_submissions
--
-- Public restaurant enquiry submissions (Digital Race / Leads & Forms
-- groundwork for Phase 2). Anonymous visitors may INSERT (public form
-- intake); reading/managing submissions follows the same hierarchy rules
-- as the rest of the system:
--   super_master_admin → everything
--   department_head    → own department subtree
--   manager / employee → submissions assigned to them
--
-- Idempotent — safe to run more than once.
-- ─────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type public.submission_status as enum (
    'new', 'contacted', 'qualified', 'converted', 'rejected'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.restaurant_submissions (
  id              uuid primary key default gen_random_uuid(),
  restaurant_name text not null,
  contact_name    text,
  email           text,
  phone           text,
  whatsapp        text,
  address         text,
  city            text,
  country         text not null default 'Sri Lanka',
  website         text,
  google_maps_url text,
  cuisine_type    text,
  branches_count  integer,
  message         text,
  source          text not null default 'website',
  status          public.submission_status not null default 'new',
  -- Raw form payload, kept so no field is ever lost.
  payload         jsonb not null default '{}'::jsonb,
  -- Triage (Phase 2 UI): which department / person owns this submission.
  department_id   uuid references public.departments (id) on delete set null,
  assigned_to     uuid references public.profiles (id) on delete set null,
  -- Abuse forensics (IP stored hashed, never raw).
  ip_hash         text,
  user_agent      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint restaurant_submissions_branches_nonnegative
    check (branches_count is null or branches_count >= 0)
);

create index if not exists restaurant_submissions_created_at_idx
  on public.restaurant_submissions (created_at desc);
create index if not exists restaurant_submissions_status_idx
  on public.restaurant_submissions (status);
create index if not exists restaurant_submissions_department_idx
  on public.restaurant_submissions (department_id);
create index if not exists restaurant_submissions_assigned_idx
  on public.restaurant_submissions (assigned_to);
create index if not exists restaurant_submissions_email_idx
  on public.restaurant_submissions (email);

drop trigger if exists trg_restaurant_submissions_updated_at on public.restaurant_submissions;
create trigger trg_restaurant_submissions_updated_at
  before update on public.restaurant_submissions
  for each row execute function public.set_updated_at();

alter table public.restaurant_submissions enable row level security;

-- Public form intake: anyone may submit (rate-limit at the app/API layer).
drop policy if exists restaurant_submissions_insert on public.restaurant_submissions;
create policy restaurant_submissions_insert on public.restaurant_submissions
  for insert to anon, authenticated
  with check (true);

-- Read: super admin all; heads/managers their department scope; assignee own.
drop policy if exists restaurant_submissions_select on public.restaurant_submissions;
create policy restaurant_submissions_select on public.restaurant_submissions
  for select to authenticated
  using (
    public.is_super_admin()
    or assigned_to = auth.uid()
    or public.can_access_department(department_id)
  );

drop policy if exists restaurant_submissions_update on public.restaurant_submissions;
create policy restaurant_submissions_update on public.restaurant_submissions
  for update to authenticated
  using (
    public.is_super_admin()
    or assigned_to = auth.uid()
    or (
      public.current_user_role() in ('department_head', 'manager')
      and public.can_access_department(department_id)
    )
  )
  with check (
    public.is_super_admin()
    or assigned_to = auth.uid()
    or (
      public.current_user_role() in ('department_head', 'manager')
      and public.can_access_department(department_id)
    )
  );

drop policy if exists restaurant_submissions_delete on public.restaurant_submissions;
create policy restaurant_submissions_delete on public.restaurant_submissions
  for delete to authenticated
  using (public.is_super_admin());

grant insert on public.restaurant_submissions to anon;
grant select, insert, update, delete on public.restaurant_submissions to authenticated;
grant all on public.restaurant_submissions to service_role;

comment on table public.restaurant_submissions is 'Public restaurant enquiry submissions (Digital Race / Leads & Forms intake). RLS: anon insert, staff read by hierarchy.';
