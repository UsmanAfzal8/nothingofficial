create table public.faqs (
  id serial not null,
  related_type public.related_type_enum not null,
  related_id integer not null,
  question text not null,
  answer text not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint faqs_pkey primary key (id)
) TABLESPACE pg_default;
