create table public.orders (
  id serial not null,
  user_id integer null,
  items jsonb not null,
  total_price numeric(10, 2) null,
  shipping_address text null,
  billing_address text null,
  payment_status public.payment_status_enum null default 'pending'::payment_status_enum,
  order_status public.order_status_enum null default 'pending'::order_status_enum,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;
