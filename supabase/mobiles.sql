create table public.mobiles (
  id serial not null,
  name character varying(255) not null,
  slug character varying(255) not null,
  description text null,
  meta_title character varying(255) null,
  meta_description text null,
  seo_keywords text null,
  canonical_url text null,
  schema_json jsonb null,
  seo_description_long text null,
  image_alt_text text null,
  release_date date null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  "Price" integer null,
  pta_tax bigint null,
  non_pta_price bigint null,
  piority integer null,
  original_price integer null,
  warranty smallint not null default 1,
  constraint mobiles_pkey primary key (id),
  constraint mobiles_slug_key unique (slug),
  constraint mobiles_warranty_check check (warranty in (1, 2)),
  constraint mobiles_original_price_check check (original_price is null or "Price" is null or original_price >= "Price")
) TABLESPACE pg_default;

create index IF not exists idx_mobiles_seo_keywords on public.mobiles using gin (to_tsvector('english', coalesce(seo_keywords, ''))) TABLESPACE pg_default;
create index IF not exists idx_mobiles_canonical_url on public.mobiles using btree (canonical_url) TABLESPACE pg_default;
create index IF not exists idx_mobiles_schema_json on public.mobiles using gin (schema_json) TABLESPACE pg_default;

create trigger trg_set_mobile_slug BEFORE INSERT
or
update on mobiles for EACH row
execute FUNCTION set_mobile_slug ();
