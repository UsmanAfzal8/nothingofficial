begin;

update public.products
set
  price = 34499,
  schema_json = case
    when schema_json is null then null
    else jsonb_set(schema_json, '{offers,price}', to_jsonb(34499::numeric), true)
  end,
  updated_at = now()
where slug = 'nothing-pakistan-ear-open';

do $$
begin
  if not exists (
    select 1
    from public.products
    where slug = 'nothing-pakistan-ear-open' and price = 34499
  ) then
    raise exception 'Ear (open) price verification failed';
  end if;
end $$;

commit;
