create table if not exists public.spec_groups (
  id serial primary key,
  related_type public.related_type_enum not null,
  related_id integer not null,

  title text not null,
  subtitle text null,
  icon_key text null,

  media_url text null,
  media_alt text null,
  media_type text null default 'image',
  media_position text null default 'top',

  default_open boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now()
);

create index if not exists idx_spec_groups_related
  on public.spec_groups using btree (related_type, related_id);

create index if not exists idx_spec_groups_sort
  on public.spec_groups using btree (related_type, related_id, sort_order);
