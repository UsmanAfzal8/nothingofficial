-- Enrich existing Nothing Pakistan catalog SEO fields after the 2026-07-28
-- product-by-product research pass.
--
-- Preconditions:
-- - Logical backup:
--   /Users/mosin/backups/nothing-pakistan/20260728-pre-seo-jzuyzC
-- - This migration updates existing rows only. It does not create tables,
--   change slugs/canonicals/prices, or invent SKU, GTIN, stock, PTA, warranty,
--   review, discount, or availability data.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
declare
  mobile_count integer;
  product_count integer;
  category_count integer;
begin
  select count(*) into mobile_count from public.mobiles;
  select count(*) into product_count from public.products;
  select count(*) into category_count from public.categories;

  if mobile_count <> 14 then
    raise exception 'Expected 14 mobiles before SEO enrichment, found %.', mobile_count;
  end if;

  if product_count <> 62 then
    raise exception 'Expected 62 products before SEO enrichment, found %.', product_count;
  end if;

  if category_count <> 6 then
    raise exception 'Expected 6 categories before SEO enrichment, found %.', category_count;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Mobiles: reviewed official-source facts and Pakistan search intent
-- ---------------------------------------------------------------------------

with mobile_updates (
  id,
  meta_title,
  meta_description,
  seo_description_long
) as (
  values
    (
      1,
      'Nothing Phone (3) Price in Pakistan | Nothing Pakistan',
      'Explore Nothing Phone (3) price in Pakistan, colours and specifications, including its Glyph Matrix, four 50 MP cameras and Snapdragon 8s Gen 4.',
      'Nothing Phone (3) is the flagship Nothing smartphone built around the Glyph Matrix, a four-camera 50 MP system with 4K Ultra HDR video, and Snapdragon 8s Gen 4 performance. Official colour options are White and Black, with 12+256GB and 16+512GB capacity choices. Review the live Pakistan price, selected variant and order terms on this page before purchasing.'
    ),
    (
      2,
      'Nothing Phone (3a) Price in Pakistan | Nothing Pakistan',
      'See Nothing Phone (3a) price in Pakistan, colours and specs, with Snapdragon 7s Gen 3, a 50 MP main camera, 30x zoom and a 5,000 mAh battery.',
      'Nothing Phone (3a) combines Snapdragon 7s Gen 3 performance with a 50 MP main camera, up to 30x zoom and Nothing''s two-day-battery positioning. Official colour choices are Black, White and Blue, with 8+128GB and 12+256GB capacities represented in the official catalogue. Check the current Pakistan price and exact selected variant before ordering.'
    ),
    (
      3,
      'Nothing Phone (3a) Lite Price in Pakistan',
      'Check Nothing Phone (3a) Lite price and specs in Pakistan, including its 50 MP triple-camera system, 5,000 mAh battery and 8+128GB or 8+256GB options.',
      'Nothing Phone (3a) Lite brings Nothing''s clear design to a lighter model with a triple-camera system led by a 50 MP main lens. The official specification lists a 5,000 mAh battery and charging to 50% in 20 minutes. It is offered in White or Black with 8+128GB and 8+256GB capacity options; confirm the live Pakistan price and selected variant on this page.'
    ),
    (
      4,
      'Nothing Phone (3a) Pro Price in Pakistan',
      'Explore Nothing Phone (3a) Pro price and specs in Pakistan, with Snapdragon 7s Gen 3, a 50 MP periscope camera, 60x ultra zoom and 3,000-nit AMOLED.',
      'Nothing Phone (3a) Pro adds a periscope camera to its 50 MP camera system for up to 60x ultra zoom. Official positioning also highlights Snapdragon 7s Gen 3 performance, a 3,000-nit AMOLED display and two-day battery use. The official catalogue records Grey and Black finishes with 12+256GB capacity. Check the current Pakistan price and exact variant before purchase.'
    ),
    (
      5,
      'Nothing Phone (4a) Price in Pakistan | Specs',
      'See Nothing Phone (4a) price and specifications in Pakistan, including its 50 MP triple camera, 70x ultra zoom, Glyph Bar and Snapdragon 7s Gen 4.',
      'Nothing Phone (4a) features a 50 MP triple-camera system with up to 70x ultra zoom, the Glyph Bar and Snapdragon 7s Gen 4 performance. Official colour options are White, Black, Pink and Blue, with 8+128GB, 8+256GB and 12+256GB capacities. Use the live product controls to confirm the available colour, capacity and current Pakistan price.'
    ),
    (
      6,
      'Nothing Phone (4a) Pro Price in Pakistan',
      'Check Nothing Phone (4a) Pro price and specs in Pakistan, with an aluminium body, Glyph Matrix, 50 MP Sony camera, 140x ultra zoom and 1.5K AMOLED.',
      'Nothing Phone (4a) Pro uses an aluminium unibody and flagship-grade Glyph Matrix. Its official camera positioning combines a 50 MP Sony main sensor with up to 140x ultra zoom, while the display is a 1.5K AMOLED panel and the processor is Snapdragon 7 Gen 4. Official variants cover Silver, Black and Pink with 8+128GB or 12+256GB capacity. Confirm the live Pakistan price and selected configuration before ordering.'
    ),
    (
      7,
      'Nothing Phone (4b) Price in Pakistan | Specs',
      'Explore Nothing Phone (4b) specifications in Pakistan, including a 50 MP OIS camera, 6.77-inch AMOLED, 5,200 mAh battery and 33 W charging.',
      'Nothing Phone (4b) pairs a 50 MP main camera with optical and electronic stabilisation, a 6.77-inch Super AMOLED display and a 5,200 mAh battery in the international specification. It supports 33 W charging, carries an IP64 rating and ships with Nothing OS 4.1 based on Android 16. Official colours are White, Black and Blue, with 8+128GB listed for the international model. No Pakistan price should be published until a verified price is available.'
    ),
    (
      8,
      'Phone (3a) Community Edition Price in Pakistan',
      'See Phone (3a) Community Edition 2025 details and the current Pakistan listing. This limited community-designed release requires local stock confirmation.',
      'Phone (3a) Community Edition 2025 was created through Nothing''s Community Edition project across hardware, software, marketing and accessory phases. Nothing''s official Community announcement describes it as a limited release with stock in selected regions. This Pakistan listing must show the current local price and availability separately; customers should confirm the exact included model, design and order terms before payment.'
    ),
    (
      9,
      'CMF Phone 2 Pro Price in Pakistan | Specs',
      'Check CMF Phone 2 Pro price and specs in Pakistan, with a 5,000 mAh battery, 8GB RAM, four-camera system and 128GB or 256GB storage.',
      'CMF Phone 2 Pro is positioned around a four-camera system, 5,000 mAh battery and 8GB RAM. Nothing''s official international page lists Orange, Black and White finishes with 8+128GB and 8+256GB capacities. Review the live Pakistan price, selected storage and colour, and confirmed order terms before buying.'
    ),
    (
      10,
      'Nothing Phone (2a) Price in Pakistan | Specs',
      'See Nothing Phone (2a) price and specifications in Pakistan, with the Glyph Interface, dual 50 MP cameras, 32 MP selfie camera and AMOLED display.',
      'Nothing Phone (2a) combines the Glyph Interface with dual 50 MP rear cameras, a 32 MP front camera and an AMOLED display. The official international page lists Milk and Black finishes with 8+128GB and 12+256GB capacity choices and uses two-day-battery positioning. Confirm the current Pakistan price and selected variant on this page before ordering.'
    ),
    (
      11,
      'CMF Phone 1 Price in Pakistan | Specifications',
      'Explore CMF Phone 1 price and specs in Pakistan, including its adaptable design, 50 MP Sony camera, 5,000 mAh battery and 128GB or 256GB storage.',
      'CMF Phone 1 uses an adaptable design with interchangeable cases and a 50 MP Sony rear camera supported by a 16 MP front camera. Nothing''s official international page lists a 5,000 mAh battery, Black, Orange and Light Green finishes, and 8+128GB or 8+256GB configurations. Check the live Pakistan price and exact configuration before purchase.'
    ),
    (
      12,
      'Nothing Phone (2a) Plus Price in Pakistan',
      'Check Nothing Phone (2a) Plus price and specifications in Pakistan, with dual 50 MP camera positioning, 12+256GB capacity and Grey or Black finishes.',
      'Nothing Phone (2a) Plus builds on the Phone (2a) family with dual 50 MP camera positioning and a 12+256GB configuration on the official product page. Official finishes are Grey and Black, and Nothing uses two-day-battery positioning for the model. Review the current Pakistan price and selected colour before ordering.'
    ),
    (
      13,
      'Nothing Phone (2) Price in Pakistan | Specs',
      'See Nothing Phone (2) price and available configurations in Pakistan, with Dark Grey or White finishes and 128GB, 256GB or 512GB storage options.',
      'Nothing Phone (2) remains represented in the official catalogue in Dark Grey and White. Its official configurations include 8+128GB, 12+256GB and 12+512GB. This page pairs those verified variants with the current Pakistan price and identifies the selected colour and capacity before checkout.'
    ),
    (
      14,
      'Nothing Phone (1) Price in Pakistan | Specs',
      'Explore Nothing Phone (1) price and configurations in Pakistan, featuring the Glyph Interface, Nothing OS, Black or White finishes and up to 12+256GB.',
      'Nothing Phone (1) introduced the Glyph Interface and Nothing OS design language. Nothing''s official page lists Black and White finishes with 8+128GB, 8+256GB and 12+256GB configurations. The UK page''s sold-out state is not evidence of Pakistan availability, so this listing uses only the locally confirmed stock and current price.'
    )
)
update public.mobiles as mobile
set
  meta_title = mobile_updates.meta_title,
  meta_description = mobile_updates.meta_description,
  seo_keywords = concat_ws(
    ', ',
    mobile.name,
    mobile.name || ' price in Pakistan',
    mobile.name || ' specifications',
    mobile.name || ' colours',
    'Nothing phones Pakistan'
  ),
  seo_description_long = mobile_updates.seo_description_long,
  image_alt_text = mobile.name || ' official product image in Pakistan',
  updated_at = now()
from mobile_updates
where mobile.id = mobile_updates.id;

-- ---------------------------------------------------------------------------
-- Official Nothing catalogue products (IDs 1-23)
-- ---------------------------------------------------------------------------

with official_product_updates (id, meta_description, description_override) as (
  values
    (1, 'Check CMF Buds 2 price in Pakistan, with AI-powered active noise cancellation, Dirac sound, clear-call technology and over 13 hours of battery life.', null),
    (2, 'Explore CMF Buds 2 Plus price in Pakistan, with Hi-Res LDAC audio, spatial audio, active noise cancellation and up to 14 hours of battery life.', null),
    (3, 'See CMF Buds 2a price in Pakistan, colours and specifications, including active noise cancellation and up to 8 hours of battery life.', null),
    (4, 'Check CMF Buds Pro 2 price in Pakistan, with dual drivers, Hi-Res Audio, Smart Dial controls, active noise cancellation and spatial audio.', null),
    (5, 'Explore CMF Headphone Pro price in Pakistan, with Hi-Res LDAC audio, active noise cancellation, personal sound and up to 100 hours of battery life.', null),
    (6, 'See CMF Headphone Pro Ear Cushions in Pakistan, made with vegan leather and high-density memory foam in Light Green and Orange.', null),
    (7, 'Explore the CMF Phone 1 Case in Pakistan, a vegan-leather case offered by Nothing in Orange, Blue and Light Green.', null),
    (8, 'Check CMF Power 100W GaN price in Pakistan, an ultra-fast three-port charger with two USB-C ports and one USB-A port.', null),
    (9, 'Check CMF Power 140W GaN price in Pakistan, with PD 3.1 support, two USB-C ports and one USB-A port.', null),
    (10, 'Explore CMF Power 65W GaN price in Pakistan, a compact three-port GaN charger with broad device compatibility.', null),
    (11, 'See CMF Watch 3 Pro price in Pakistan, with an AMOLED display, dual-band GPS, 131 sport modes and up to 13 days of battery life.', null),
    (12, 'Check Nothing Ear price in Pakistan, with Hi-Res LDAC and LHDC audio, active noise cancellation and over 40 hours of battery life.', null),
    (13, 'Explore Nothing Ear (3) price in Pakistan, with Hi-Res LDAC audio, Super Mic, active noise cancellation, Dynamic Bass and 3D Soundscapes.', null),
    (14, 'See Nothing Ear (3a) details in Pakistan, with 12 mm drivers, Hi-Res LDAC audio, adaptive 45 dB noise cancellation and Bluetooth 6.0.', 'Nothing Ear (3a) features 12 mm dynamic drivers, Hi-Res LDAC audio, adaptive active noise cancellation up to 45 dB, Bluetooth 6.0 and dual-device connection.'),
    (15, 'Check Nothing Ear (a) price in Pakistan, with Hi-Res LDAC audio, active noise cancellation, Bass Enhance and over 40 hours of battery life.', null),
    (16, 'Explore Nothing Ear (open) price in Pakistan, with open-sound technology, a movement-ready silicone design and up to 30 hours of battery life.', null),
    (17, 'See Nothing Headphone (1) price in Pakistan, with KEF-tuned Hi-Res Audio, active noise cancellation, tactile controls and an 80-hour battery.', null),
    (18, 'Explore Nothing Headphone (a) price in Pakistan, with Hi-Res LDAC audio, active noise cancellation, tactile controls and five-day battery positioning.', null),
    (19, 'Explore the Nothing Hoodie in Pakistan, an oversized 100% organic-cotton hoodie with two front pockets, a hood and rib-knit hem.', null),
    (20, 'Explore the Nothing Labcoat in Pakistan, a clear relaxed-fit nylon coat with multiple pockets and an adjustable waist.', null),
    (21, 'Explore the Nothing Overall in Pakistan, made from 100% organic cotton with raglan sleeves, a straight leg and metal front closure.', null),
    (22, 'Explore the Nothing Tracksuit Jacket in Pakistan, a relaxed recycled-nylon jacket with chest pockets and a packable hood.', null),
    (23, 'Explore the Nothing Tracksuit Trousers in Pakistan, made from recycled nylon ripstop with a straight leg, elasticated waist and drawstring.', null)
)
update public.products as product
set
  description = coalesce(official_product_updates.description_override, product.description),
  short_description = coalesce(official_product_updates.description_override, product.short_description, product.description),
  meta_title = case
    when length(product.name) > 30 then product.name || ' in Pakistan'
    else product.name || ' Price in Pakistan | Nothing Pakistan'
  end,
  meta_description = official_product_updates.meta_description,
  seo_keywords = concat_ws(
    ', ',
    product.name,
    product.name || ' price in Pakistan',
    product.name || ' specifications',
    product.name || ' colours',
    coalesce(replace(product.product_type::text, '_', ' ') || ' Pakistan', 'Nothing product Pakistan')
  ),
  seo_description_long =
    coalesce(official_product_updates.description_override, product.description)
    || ' Review the current Pakistan price, available colour options, specifications and order terms on this page before purchase.',
  image_alt_text = product.name || ' official product image in Pakistan',
  updated_at = now()
from official_product_updates
where product.id = official_product_updates.id;

-- ---------------------------------------------------------------------------
-- Existing local catalogue products (IDs 24-62)
--
-- These rows had repetitive copy naming another domain and referring to
-- irrelevant storage/colour checks for simple accessories. Keep the verified
-- names and prices, but replace that copy with neutral product-specific text.
-- ---------------------------------------------------------------------------

update public.products
set
  description =
    name || ' is listed in the Nothing Pakistan catalogue. Review the current price, product details, compatibility, availability and order terms before purchase.',
  short_description =
    name || ' for Pakistan customers, with live PKR pricing and ordering details.',
  meta_title = case
    when length(name) > 30 then name || ' in Pakistan'
    else name || ' Price in Pakistan | Nothing Pakistan'
  end,
  meta_description =
    'Explore ' || name || ' price and product details in Pakistan. Check compatibility, current availability, delivery and order terms before purchase.',
  seo_keywords = concat_ws(
    ', ',
    name,
    name || ' price in Pakistan',
    name || ' Pakistan',
    coalesce(replace(product_type::text, '_', ' ') || ' Pakistan', 'Nothing accessories Pakistan')
  ),
  seo_description_long =
    name || ' is available as a dedicated Nothing Pakistan catalogue listing. Use this page to check the live PKR price, product type, compatible model where relevant, current availability, delivery information and final order terms.',
  image_alt_text = name || ' product image in Pakistan',
  updated_at = now()
where id between 24 and 62;

-- Preserve the colour relationship while making variant-image alternatives
-- explicit and unique. Only rows with a verified colour relation are touched.
update public.images as image
set
  alt_text = entity.name || ' in ' || color.name || ' product image',
  updated_at = now()
from public.colors as color
join (
  select id, name, 'product'::public.related_type_enum as related_type
  from public.products
  union all
  select id, name, 'mobile'::public.related_type_enum as related_type
  from public.mobiles
) as entity on true
where image.color_id = color.id
  and image.related_type = entity.related_type
  and image.related_id = entity.id;

-- ---------------------------------------------------------------------------
-- Categories: useful indexable copy without inventing stock or availability
-- ---------------------------------------------------------------------------

with category_updates (
  id,
  meta_title,
  meta_description,
  seo_keywords,
  seo_description_long
) as (
  values
    (
      1,
      'Nothing Earbuds & Headphones Price in Pakistan',
      'Compare Nothing and CMF earbuds, open-ear audio and headphones in Pakistan with live prices, colours, specifications and product pages.',
      'Nothing earbuds Pakistan, CMF earbuds price in Pakistan, Nothing headphones Pakistan, wireless audio Pakistan',
      'Browse Nothing and CMF audio products in Pakistan, including true-wireless earbuds, open-ear models and over-ear headphones. Compare live PKR prices, colour options, battery and noise-cancellation specifications, then open each product page for current ordering details.'
    ),
    (
      7,
      'Nothing Phone Cases & Covers in Pakistan',
      'Browse Nothing and CMF phone cases and covers in Pakistan. Match the exact phone model, review the live price and confirm compatibility before ordering.',
      'Nothing phone cases Pakistan, Nothing phone covers, CMF Phone case Pakistan, Phone 3a cover Pakistan',
      'Find cases and covers organised by their compatible Nothing or CMF phone model. Product names preserve the target model so buyers can distinguish Phone (3), Phone (3a), Pro, Lite and CMF accessories before checking the live price and order terms.'
    ),
    (
      8,
      'Nothing & CMF Chargers Price in Pakistan',
      'Compare Nothing and CMF GaN chargers, power adapters and USB-C cables in Pakistan with live prices, wattage and port information.',
      'Nothing charger price in Pakistan, CMF GaN charger Pakistan, 65W charger Pakistan, 100W charger Pakistan, USB-C cable Pakistan',
      'Browse Nothing and CMF charging products in Pakistan, including 45 W, 65 W, 100 W and 140 W options plus USB-C cables. Check each product page for its verified wattage, port layout, compatibility, live price and current ordering details.'
    ),
    (
      11,
      'CMF Watches Price in Pakistan | Nothing Pakistan',
      'Compare CMF Watch models in Pakistan with live prices, displays, GPS, sport tracking, battery information and available colours.',
      'CMF Watch price in Pakistan, CMF Watch Pro Pakistan, CMF Watch Pro 2 Pakistan, CMF Watch 3 Pro Pakistan',
      'Compare CMF smartwatches available in the Nothing Pakistan catalogue. Review model-specific display, GPS, activity tracking, battery and colour information, then confirm the live PKR price and current availability on the product page.'
    ),
    (
      19,
      'Nothing Apparel in Pakistan | Clothing & Accessories',
      'Explore official-source Nothing apparel details in Pakistan, including the Nothing Hoodie, Labcoat, Overall and recycled-nylon tracksuit pieces.',
      'Nothing apparel Pakistan, Nothing hoodie Pakistan, Nothing labcoat, Nothing tracksuit',
      'Explore Nothing apparel represented from official Nothing product sources, including organic-cotton and recycled-nylon pieces. Product pages describe the verified material, fit and design details; local price and availability are shown only when confirmed.'
    ),
    (
      24,
      'Nothing Phone Price in Pakistan | Compare Models',
      'Compare Nothing and CMF phone prices in Pakistan, specifications, colours, storage options, cameras and batteries across available models.',
      'Nothing phone price in Pakistan, CMF phone price in Pakistan, Nothing Phone specifications, Nothing mobiles Pakistan',
      'Compare Nothing and CMF phones in Pakistan across current and earlier models. Each product page combines the live PKR price with verified specifications, colour and capacity information where available. Use the comparison tool for phone-to-phone specifications and confirm the exact local variant before purchase.'
    )
)
update public.categories as category
set
  meta_title = category_updates.meta_title,
  meta_description = category_updates.meta_description,
  seo_keywords = category_updates.seo_keywords,
  seo_description_long = category_updates.seo_description_long,
  updated_at = now()
from category_updates
where category.id = category_updates.id;

do $$
declare
  incomplete_mobiles integer;
  incomplete_products integer;
  incomplete_categories integer;
begin
  select count(*) into incomplete_mobiles
  from public.mobiles
  where meta_title is null
    or meta_description is null
    or seo_keywords is null
    or seo_description_long is null
    or image_alt_text is null;

  select count(*) into incomplete_products
  from public.products
  where meta_title is null
    or meta_description is null
    or seo_keywords is null
    or seo_description_long is null
    or image_alt_text is null;

  select count(*) into incomplete_categories
  from public.categories
  where meta_title is null
    or meta_description is null
    or seo_keywords is null
    or seo_description_long is null;

  if incomplete_mobiles <> 0
    or incomplete_products <> 0
    or incomplete_categories <> 0 then
    raise exception
      'SEO enrichment incomplete: mobiles %, products %, categories %.',
      incomplete_mobiles,
      incomplete_products,
      incomplete_categories;
  end if;
end
$$;

commit;

select
  (select count(*) from public.mobiles where seo_description_long is not null) as enriched_mobiles,
  (select count(*) from public.products where seo_description_long is not null) as enriched_products,
  (select count(*) from public.categories where seo_description_long is not null) as enriched_categories;
