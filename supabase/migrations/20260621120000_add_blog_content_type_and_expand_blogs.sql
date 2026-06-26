do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'blog_content_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.blog_content_type as enum (
      'blog',
      'guide',
      'comparison',
      'news',
      'review',
      'faq'
    );
  end if;
end
$$;

alter table public.blogs
  add column if not exists excerpt text null,
  add column if not exists focus_keyword character varying(255) null,
  add column if not exists category character varying(100) null,
  add column if not exists tags text[] null,
  add column if not exists author character varying(255) null,
  add column if not exists author_type character varying(50) null,
  add column if not exists content_type public.blog_content_type null,
  add column if not exists reading_time integer null,
  add column if not exists featured_image_id integer null,
  add column if not exists is_published boolean null default false,
  add column if not exists published_at timestamp without time zone null;

update public.blogs
set content_type = 'blog'
where content_type is null;

alter table public.blogs
  alter column content_type set not null;
