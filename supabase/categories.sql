create table public.categories (
  id serial not null,
  name character varying(255) not null,
  slug character varying(255) not null,
  meta_title character varying(255) null,
  meta_description text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  parent_id integer null,
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug),
  constraint categories_parent_id_fkey foreign KEY (parent_id) references categories (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_categories_parent on public.categories using btree (parent_id) TABLESPACE pg_default;
