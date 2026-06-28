alter table public.mobiles
  add column if not exists original_price integer null,
  add column if not exists warranty smallint;

update public.mobiles
set
  original_price = case
    when "Price" is null then null
    else round("Price" * 1.10)::integer
  end,
  warranty = case
    when slug in (
      'nothing-pakistan-nothing-4a-pro',
      'nothing-pakistan-phone-4a-pro',
      'nothing-pakistan-phone-4a'
    ) then 2
    else 1
  end;

alter table public.mobiles
  alter column warranty set default 1,
  alter column warranty set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'mobiles_warranty_check'
      and conrelid = 'public.mobiles'::regclass
  ) then
    alter table public.mobiles
      add constraint mobiles_warranty_check check (warranty in (1, 2));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'mobiles_original_price_check'
      and conrelid = 'public.mobiles'::regclass
  ) then
    alter table public.mobiles
      add constraint mobiles_original_price_check
      check (original_price is null or "Price" is null or original_price >= "Price");
  end if;
end
$$;
