create table public.reviews (
  id serial not null,
  product_id integer null,
  user_name character varying(255) not null,
  rating integer null,
  comment text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint reviews_pkey primary key (id),
  constraint reviews_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;
