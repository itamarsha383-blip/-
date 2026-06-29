-- ============================================================================
-- Novixel.ai — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) ADMINS — allowlist of who may log into the admin panel.
--    A Supabase Auth user is only an admin if their id appears here.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'admin',   -- 'admin' | 'owner'
  created_at timestamptz not null default now()
);

-- helper: is the current request an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 2) SITE CONTENT — one editable JSON document per locale.
--    The public site reads it; the admin panel writes it. "Edit everything".
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  locale     text primary key,                -- 'en' | 'es'
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- seed empty rows for the two public locales (safe to re-run)
insert into public.site_content (locale, content) values
  ('en', '{}'::jsonb), ('es', '{}'::jsonb)
on conflict (locale) do nothing;

-- ---------------------------------------------------------------------------
-- 3) LEADS — every form submission. This is the "customer memory" inbox.
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  full_name           text,
  business_email      text,
  business_type       text,
  monthly_lead_volume text,
  message             text,
  locale              text,                    -- which language the visitor used
  source              text,
  page                text,
  status              text not null default 'new',  -- new | contacted | booked | archived
  notes               text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx      on public.leads (status);

-- ---------------------------------------------------------------------------
-- 4) ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.admins       enable row level security;
alter table public.site_content enable row level security;
alter table public.leads        enable row level security;

-- admins: an admin can read the allowlist (used by the panel to verify access)
drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins
  for select using (public.is_admin());

-- site_content: anyone (anon) may READ; only admins may WRITE.
drop policy if exists content_read on public.site_content;
create policy content_read on public.site_content
  for select using (true);

drop policy if exists content_write on public.site_content;
create policy content_write on public.site_content
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists content_insert on public.site_content;
create policy content_insert on public.site_content
  for insert with check (public.is_admin());

-- leads: anon may INSERT (public form) but NOT read; admins may do everything.
drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads
  for insert with check (true);

drop policy if exists leads_admin_select on public.leads;
create policy leads_admin_select on public.leads
  for select using (public.is_admin());

drop policy if exists leads_admin_update on public.leads;
create policy leads_admin_update on public.leads
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists leads_admin_delete on public.leads;
create policy leads_admin_delete on public.leads
  for delete using (public.is_admin());

-- keep updated_at fresh on content writes
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); new.updated_by = auth.uid(); return new; end; $$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- AFTER RUNNING THIS:
--   1. Authentication → Users → "Add user" (your email + password).
--   2. Copy that user's UUID, then run (replace the values):
--        insert into public.admins (user_id, email, role)
--        values ('PASTE-UUID-HERE', 'you@example.com', 'owner');
--   3. Settings → API → copy "Project URL" and the "anon public" key
--      into  /admin/config.js  and  /assets/config.js
-- ============================================================================
