alter table public.models
  add column if not exists media_history jsonb not null default '[]'::jsonb;

alter table public.models
  drop constraint if exists models_media_history_array_check;

alter table public.models
  add constraint models_media_history_array_check
  check (jsonb_typeof(media_history) = 'array');
