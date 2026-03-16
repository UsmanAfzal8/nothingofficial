create table public.products (
  id serial not null,
  name character varying(255) not null,
  slug character varying(255) not null,
  description text null,
  short_description text null,
  meta_title character varying(255) null,
  meta_description text null,
  price numeric(10, 2) null,
  stock_quantity integer null default 0,
  main_color_id integer null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  product_type public.product_type_enum null,
  constraint products_pkey primary key (id),
  constraint products_slug_key unique (slug),
  constraint fk_main_color foreign KEY (main_color_id) references colors (id)
) TABLESPACE pg_default;
