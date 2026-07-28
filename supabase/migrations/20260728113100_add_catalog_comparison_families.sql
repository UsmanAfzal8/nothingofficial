-- Add strict comparison families and a compact read model for the comparison UI.
-- Checked against the Nothing Pakistan catalog on 2026-07-28.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Correct previously untyped catalog rows before deriving comparison families.
update public.products
set product_type = 'earbuds'
where name in ('Ear (3)', 'Ear (a)', 'Ear (open)')
  and product_type is null;

update public.products
set product_type = 'headphones'
where name in ('CMF Headphone Pro', 'Headphone (1)', 'Headphone (a)')
  and product_type is null;

update public.products
set product_type = 'watch'
where name in ('CMF Watch 3 Pro', 'CMF Watch Pro', 'CMF Watch Pro 2')
  and product_type is null;

alter table public.products
  add column comparison_family text
  generated always as (
    case product_type
      when 'earbuds'::public.product_type_enum then 'earbuds'
      when 'headphones'::public.product_type_enum then 'headphones'
      when 'watch'::public.product_type_enum then 'watch'
      when 'charger'::public.product_type_enum then 'charger'
      else null
    end
  ) stored;

alter table public.products
  add constraint products_comparison_family_check
  check (
    comparison_family is null
    or comparison_family in ('earbuds', 'headphones', 'watch', 'charger')
  );

alter table public.mobiles
  add column comparison_family text
  generated always as ('mobile'::text) stored;

alter table public.mobiles
  add constraint mobiles_comparison_family_check
  check (comparison_family = 'mobile');

create index products_comparison_family_name_idx
  on public.products (comparison_family, name)
  where comparison_family is not null;

create index mobiles_comparison_family_priority_name_idx
  on public.mobiles (comparison_family, piority, name);

create view public.comparison_items
with (security_invoker = true, security_barrier = true)
as
select
  'product:' || products.id::text as item_key,
  'product'::text as entity_type,
  products.id as entity_id,
  products.comparison_family,
  products.name,
  products.slug as handle,
  coalesce(products.short_description, products.description) as summary,
  products.price,
  null::numeric as original_price,
  null::smallint as warranty_years,
  null::integer as sort_priority,
  primary_image.url as image_url,
  coalesce(primary_image.alt_text, products.image_alt_text, products.name) as image_alt
from public.products
left join lateral (
  select images.url, images.alt_text
  from public.images
  where images.related_type = 'product'
    and images.related_id = products.id
  order by images.sort_order, images.id
  limit 1
) as primary_image on true
where products.comparison_family is not null

union all

select
  'mobile:' || mobiles.id::text as item_key,
  'mobile'::text as entity_type,
  mobiles.id as entity_id,
  mobiles.comparison_family,
  mobiles.name,
  mobiles.slug as handle,
  mobiles.description as summary,
  mobiles."Price"::numeric as price,
  mobiles.original_price::numeric,
  mobiles.warranty as warranty_years,
  mobiles.piority as sort_priority,
  primary_image.url as image_url,
  coalesce(primary_image.alt_text, mobiles.image_alt_text, mobiles.name) as image_alt
from public.mobiles
left join lateral (
  select images.url, images.alt_text
  from public.images
  where images.related_type = 'mobile'
    and images.related_id = mobiles.id
  order by images.sort_order, images.id
  limit 1
) as primary_image on true;

grant select on table public.comparison_items to anon, authenticated;

commit;

-- Verification: every family should have at least two distinct items.
select
  comparison_family,
  count(*) as item_count
from public.comparison_items
group by comparison_family
order by comparison_family;
