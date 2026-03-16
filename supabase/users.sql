create table public.users (
  id serial not null,
  name character varying(255) not null,
  phone character varying(20) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  "Address" text null,
  "Postal Code" text null,
  "City" text null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;
