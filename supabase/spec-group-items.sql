create table if not exists public.spec_group_items (
  id serial primary key,
  spec_group_id integer not null references public.spec_groups(id) on delete cascade,
  section text null,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now()
);

create index if not exists idx_spec_group_items_group
  on public.spec_group_items using btree (spec_group_id);

create index if not exists idx_spec_group_items_sort
  on public.spec_group_items using btree (spec_group_id, sort_order);
