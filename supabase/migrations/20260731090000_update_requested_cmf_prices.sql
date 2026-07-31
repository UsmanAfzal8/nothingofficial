begin;

with requested_prices(slug, selling_price) as (
  values
    ('nothing-pakistan-cmf-power-65w-gan', 10999::numeric),
    ('nothing-pakistan-cmf-buds-pro-2', 16499::numeric),
    ('nothing-pakistan-cmf-buds-2-plus', 14999::numeric),
    ('nothing-pakistan-cmf-watch-3-pro', 27999::numeric),
    ('nothing-pakistan-cmf-watch-pro', 14499::numeric)
)
update public.products as products
set
  price = requested_prices.selling_price,
  schema_json = case
    when products.schema_json is null then null
    else jsonb_set(products.schema_json, '{offers,price}', to_jsonb(requested_prices.selling_price), true)
  end,
  updated_at = now()
from requested_prices
where products.slug = requested_prices.slug;

do $$
declare
  updated_count integer;
begin
  select count(*) into updated_count
  from public.products
  where (slug, price) in (
    ('nothing-pakistan-cmf-power-65w-gan', 10999::numeric),
    ('nothing-pakistan-cmf-buds-pro-2', 16499::numeric),
    ('nothing-pakistan-cmf-buds-2-plus', 14999::numeric),
    ('nothing-pakistan-cmf-watch-3-pro', 27999::numeric),
    ('nothing-pakistan-cmf-watch-pro', 14499::numeric)
  );

  if updated_count <> 5 then
    raise exception 'Expected to verify 5 requested product prices, verified %', updated_count;
  end if;
end $$;

commit;
