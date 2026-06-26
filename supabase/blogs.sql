create type public.blog_content_type as enum (
  'blog',
  'guide',
  'comparison',
  'news',
  'review',
  'faq'
);

create table public.blogs (
  id serial not null,
  title character varying(255) not null,
  slug character varying(255) not null,
  content text not null,
  meta_title character varying(255) null,
  meta_description text null,
  excerpt text null,
  focus_keyword character varying(255) null,
  category character varying(100) null,
  tags text[] null,
  author character varying(255) null,
  author_type character varying(50) null,
  content_type public.blog_content_type not null,
  reading_time integer null,
  featured_image_id integer null,
  is_published boolean null default false,
  published_at timestamp without time zone null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint blogs_pkey primary key (id),
  constraint blogs_slug_key unique (slug)
) TABLESPACE pg_default;
