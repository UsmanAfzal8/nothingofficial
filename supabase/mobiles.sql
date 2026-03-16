create table public.mobiles (
  id serial not null,
  name character varying(255) not null,
  slug character varying(255) not null,
  description text null,
  meta_title character varying(255) null,
  meta_description text null,
  release_date date null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  "Price" integer null,
  constraint mobiles_pkey primary key (id),
  constraint mobiles_slug_key unique (slug)
) TABLESPACE pg_default;

create trigger trg_set_mobile_slug BEFORE INSERT
or
update on mobiles for EACH row
execute FUNCTION set_mobile_slug ();
