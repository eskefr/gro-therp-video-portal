-- Extension support for UUID generation.
create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.models (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  phone text not null unique check (length(trim(phone)) > 0),
  email text,
  city text,
  height_cm integer check (height_cm is null or height_cm between 130 and 220),
  bust_cm integer check (bust_cm is null or bust_cm between 50 and 160),
  waist_cm integer check (waist_cm is null or waist_cm between 45 and 160),
  hips_cm integer check (hips_cm is null or hips_cm between 50 and 170),
  shoe_size numeric(4, 1) check (shoe_size is null or shoe_size between 30 and 52),
  hair_color text,
  eye_color text,
  bio text,
  headshot_url text not null,
  is_hidden boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index models_archive_idx
  on public.models (created_at desc)
  where status = 'approved' and is_hidden = false;

create index models_status_idx on public.models (status, created_at desc);
create index models_city_idx on public.models (city) where status = 'approved' and is_hidden = false;

create table public.casts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  client_name text,
  description text,
  location text,
  shoot_start date,
  shoot_end date,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint casts_shoot_dates_check check (
    shoot_end is null or shoot_start is null or shoot_end >= shoot_start
  )
);

create index casts_status_idx on public.casts (status, shoot_start);

create table public.cast_members (
  id uuid primary key default gen_random_uuid(),
  cast_id uuid not null references public.casts (id) on delete cascade,
  model_id uuid not null references public.models (id) on delete cascade,
  role_notes text,
  submission_media jsonb not null default '[]'::jsonb check (jsonb_typeof(submission_media) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cast_id, model_id)
);

create index cast_members_cast_idx on public.cast_members (cast_id);
create index cast_members_model_idx on public.cast_members (model_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique check (length(token) >= 8),
  cast_id uuid not null references public.casts (id) on delete cascade,
  target_model_id uuid references public.models (id) on delete cascade,
  claimed_model_id uuid references public.models (id) on delete set null,
  require_media_upload boolean not null default false,
  expires_at timestamptz not null,
  draft_data jsonb not null default '{}'::jsonb check (jsonb_typeof(draft_data) = 'object'),
  status text not null default 'active'
    check (status in ('active', 'in_progress', 'submitted', 'completed', 'expired')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invitations_cast_idx on public.invitations (cast_id);
create index invitations_target_idx on public.invitations (target_model_id);
create index invitations_status_idx on public.invitations (status, expires_at);

create trigger models_touch_updated_at
before update on public.models
for each row execute function public.touch_updated_at();

create trigger casts_touch_updated_at
before update on public.casts
for each row execute function public.touch_updated_at();

create trigger cast_members_touch_updated_at
before update on public.cast_members
for each row execute function public.touch_updated_at();

create trigger invitations_touch_updated_at
before update on public.invitations
for each row execute function public.touch_updated_at();

alter table public.models enable row level security;
alter table public.casts enable row level security;
alter table public.cast_members enable row level security;
alter table public.invitations enable row level security;

create policy "Visible approved models are public"
on public.models
for select
to anon, authenticated
using (status = 'approved' and is_hidden = false);

revoke all on table public.models from anon, authenticated;
revoke all on table public.casts from anon, authenticated;
revoke all on table public.cast_members from anon, authenticated;
revoke all on table public.invitations from anon, authenticated;

grant select (
  id, name, city, height_cm, bust_cm, waist_cm, hips_cm,
  shoe_size, hair_color, eye_color, bio, headshot_url,
  status, is_hidden, created_at
) on table public.models to anon, authenticated;
grant all on table public.models to service_role;
grant all on table public.casts to service_role;
grant all on table public.cast_members to service_role;
grant all on table public.invitations to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('headshots', 'headshots', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('casting-media', 'casting-media', false, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
