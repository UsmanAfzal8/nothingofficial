-- Product software/app feature section model.
-- Use this same model for official feature stacks such as Nothing OS and Nothing X.

create table if not exists public.product_feature_sections (
  id serial primary key,
  related_type public.related_type_enum not null,
  related_id integer not null,

  source_key text null,
  feature_key text not null,
  feature_title text not null,
  feature_version text null,
  title text not null,
  display_context text not null default 'mobile',

  cover_image_url text null,
  cover_video_playback_id text null,
  cover_video_url text null,
  cover_thumbnail_url text null,

  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),

  constraint product_feature_sections_display_context_check
    check (display_context in ('mobile', 'desktop', 'all'))
);

alter table public.product_feature_sections
  add column if not exists feature_version text null;

create index if not exists idx_product_feature_sections_related
  on public.product_feature_sections using btree (related_type, related_id);

create index if not exists idx_product_feature_sections_sort
  on public.product_feature_sections using btree (related_type, related_id, sort_order);

create index if not exists idx_product_feature_sections_feature
  on public.product_feature_sections using btree (related_type, related_id, feature_key, sort_order);

create table if not exists public.product_feature_slides (
  id serial primary key,
  product_feature_section_id integer not null references public.product_feature_sections(id) on delete cascade,

  source_key text null,
  title text not null,
  body text null,

  media_type text not null default 'image',
  image_url text null,
  video_playback_id text null,
  video_url text null,
  thumbnail_url text null,

  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),

  constraint product_feature_slides_media_type_check
    check (media_type in ('image', 'video'))
);

create index if not exists idx_product_feature_slides_section
  on public.product_feature_slides using btree (product_feature_section_id, sort_order);
