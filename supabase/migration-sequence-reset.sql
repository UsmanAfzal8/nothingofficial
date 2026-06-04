-- Helper for scripts/migrate-supabase-to-cloudinary.mjs.
-- Run this once in the destination Supabase SQL editor before a replace migration
-- if no existing exec_sql/execute_sql/run_sql RPC is available.

create or replace function public.reset_nothing_official_migration_sequences()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform setval(pg_get_serial_sequence('public.colors', 'id'), coalesce((select max(id) from public.colors), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.categories', 'id'), coalesce((select max(id) from public.categories), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.products', 'id'), coalesce((select max(id) from public.products), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.mobiles', 'id'), coalesce((select max(id) from public.mobiles), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.images', 'id'), coalesce((select max(id) from public.images), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.faqs', 'id'), coalesce((select max(id) from public.faqs), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.blogs', 'id'), coalesce((select max(id) from public.blogs), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.spec_groups', 'id'), coalesce((select max(id) from public.spec_groups), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.spec_group_items', 'id'), coalesce((select max(id) from public.spec_group_items), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.product_feature_sections', 'id'), coalesce((select max(id) from public.product_feature_sections), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.product_feature_slides', 'id'), coalesce((select max(id) from public.product_feature_slides), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.category_relations', 'id'), coalesce((select max(id) from public.category_relations), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.product_mobiles', 'id'), coalesce((select max(id) from public.product_mobiles), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.reviews', 'id'), coalesce((select max(id) from public.reviews), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.users', 'id'), coalesce((select max(id) from public.users), 0) + 1, false);
  perform setval(pg_get_serial_sequence('public.orders', 'id'), coalesce((select max(id) from public.orders), 0) + 1, false);
end;
$$;

create or replace function public.nothing_official_migration_sequence_reset_ready()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select true;
$$;
