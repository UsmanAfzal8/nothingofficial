create table public.product_mobiles (
  id serial not null,
  product_id integer null,
  mobile_id integer null,
  created_at timestamp without time zone null default now(),
  constraint product_mobiles_pkey primary key (id),
  constraint product_mobiles_mobile_id_fkey foreign KEY (mobile_id) references mobiles (id) on delete CASCADE,
  constraint product_mobiles_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;
