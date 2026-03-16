create table public.category_relations (
  id serial not null,
  category_id integer not null,
  related_type public.related_type_enum not null,
  related_id integer not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint category_relations_pkey primary key (id),
  constraint category_relations_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_category_relations_category on public.category_relations using btree (category_id) TABLESPACE pg_default;

create index IF not exists idx_category_relations_related on public.category_relations using btree (related_type, related_id) TABLESPACE pg_default;

create unique INDEX IF not exists uq_category_relations_unique on public.category_relations using btree (category_id, related_type, related_id) TABLESPACE pg_default;
