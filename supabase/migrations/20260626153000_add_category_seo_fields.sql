alter table public.categories
  add column if not exists seo_keywords text,
  add column if not exists canonical_url text,
  add column if not exists schema_json jsonb,
  add column if not exists seo_description_long text;

create index if not exists idx_categories_seo_keywords
  on public.categories using gin (to_tsvector('english', coalesce(seo_keywords, '')));

create index if not exists idx_categories_canonical_url
  on public.categories using btree (canonical_url);

create index if not exists idx_categories_schema_json
  on public.categories using gin (schema_json);
