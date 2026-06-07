create table public.reviews (
  id serial not null,
  related_type public.related_type_enum null,
  related_id integer null,
  user_name character varying(255) not null,
  rating integer null,
  comment text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint reviews_pkey primary key (id),
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_reviews_related on public.reviews using btree (related_type, related_id) TABLESPACE pg_default;
