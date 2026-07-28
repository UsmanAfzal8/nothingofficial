-- Enum additions must commit before PostgreSQL permits rows to use the values.
alter type public.product_type_enum add value if not exists 'headphones';
alter type public.product_type_enum add value if not exists 'watch';
