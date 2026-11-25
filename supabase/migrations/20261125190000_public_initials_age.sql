alter table public.models add column if not exists age integer;
alter table public.models add column if not exists initials text;

update public.models
set initials = upper(
  left(name, 1) || coalesce(left(split_part(name, ' ', 2), 1), '')
)
where initials is null;

create or replace function public.set_model_initials()
returns trigger
language plpgsql
as $$
begin
  new.initials := upper(
    left(new.name, 1) || coalesce(left(split_part(new.name, ' ', 2), 1), '')
  );
  return new;
end;
$$;

drop trigger if exists models_set_initials on public.models;

create trigger models_set_initials
before insert or update of name on public.models
for each row execute function public.set_model_initials();

alter table public.models alter column initials set not null;
alter table public.models
  add constraint models_age_check check (age is null or age between 18 and 90);

revoke all on table public.models from anon, authenticated;

grant select (
  id, initials, age, headshot_url, status, is_hidden, created_at
) on table public.models to anon, authenticated;
