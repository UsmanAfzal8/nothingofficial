create table public.colors (
  id serial not null,
  name character varying(50) not null,
  hex_code character varying(7) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint colors_pkey primary key (id)
) TABLESPACE pg_default;
