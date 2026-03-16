create table public.images (
  id serial not null,
  related_type public.related_type_enum not null,
  related_id integer not null,
  color_id integer null,
  url character varying(500) not null,
  alt_text character varying(255) null,
  created_at timestamp without time zone null default now(),
  title character varying(160) null,
  caption text null,
  file_name character varying(255) null,
  slug character varying(200) null,
  sort_order integer not null default 0,
  updated_at timestamp without time zone not null default now(),
  constraint images_pkey primary key (id),
  constraint images_color_id_fkey foreign KEY (color_id) references colors (id)
) TABLESPACE pg_default;

create index IF not exists idx_images_related on public.images using btree (related_type, related_id) TABLESPACE pg_default;

create index IF not exists idx_images_sort on public.images using btree (related_type, related_id, sort_order) TABLESPACE pg_default;

create index IF not exists idx_images_slug on public.images using btree (slug) TABLESPACE pg_default;

create unique INDEX IF not exists uq_images_related_slug on public.images using btree (related_type, related_id, slug) TABLESPACE pg_default;

create trigger trg_set_image_slug BEFORE INSERT
or
update on images for EACH row
execute FUNCTION set_image_slug ();
