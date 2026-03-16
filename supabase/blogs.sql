create table public.blogs (
  id serial not null,
  title character varying(255) not null,
  slug character varying(255) not null,
  content text not null,
  meta_title character varying(255) null,
  meta_description text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint blogs_pkey primary key (id),
  constraint blogs_slug_key unique (slug)
) TABLESPACE pg_default;
