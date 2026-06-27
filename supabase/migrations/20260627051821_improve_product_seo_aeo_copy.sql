-- Product SEO/AEO copy for the June 2026 audit.
-- Prices are formatted from the live catalog so this migration does not
-- overwrite the source of truth with stale prices from the audit document.

with mobile_copy(slug, seo_name, meta_tail, answer_tail) as (
  values
    (
      'nothing-pakistan-phone-1',
      'Nothing Phone (1)',
      'Transparent design, Glyph Interface, OLED display and local buying support from SECP-registered Nothing Pakistan.',
      'Key features include the transparent Nothing design, Glyph Interface, an OLED display and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-2',
      'Nothing Phone (2)',
      'Glyph Interface, flagship Snapdragon performance and Nothing OS with Pakistan-wide ordering support.',
      'Key features include the Glyph Interface, flagship Snapdragon performance, an OLED display and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-2a',
      'Nothing Phone (2a)',
      'Dimensity 7200 Pro, dual 50MP cameras and a 5000mAh battery. Check current PTA status before ordering.',
      'Key features include the Dimensity 7200 Pro platform, dual 50MP cameras, a 5000mAh battery and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-2a-plus',
      'Nothing Phone (2a) Plus',
      'Upgraded performance, 50MP cameras and long battery life. Check current PTA status before ordering.',
      'Key features include upgraded Phone (2a) performance, 50MP cameras, long battery life and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-3',
      'Nothing Phone (3)',
      'Four 50MP cameras, Glyph Interface and Nothing OS. Check current PTA status before ordering.',
      'Key features include four 50MP cameras, the Glyph Interface, Essential AI tools and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-3a',
      'Nothing Phone (3a)',
      'Telephoto camera, 120Hz AMOLED display and long battery life. Check current PTA status before ordering.',
      'Key features include a telephoto camera, 120Hz AMOLED display, long battery life and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-3a-community-edition',
      'Nothing Phone (3a) Community Edition',
      'Community-designed finish with Phone (3a) performance, cameras and Nothing OS for buyers in Pakistan.',
      'This Community Edition combines the Phone (3a) platform with a distinctive community-designed finish and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-3a-lite',
      'Nothing Phone (3a) Lite',
      '120Hz AMOLED display, clean Nothing OS and long battery life. Check current PTA status before ordering.',
      'Key features include a 120Hz AMOLED display, long battery life, a dual-camera system and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-3a-pro',
      'Nothing Phone (3a) Pro',
      'Pro triple-camera system, 120Hz AMOLED display and long battery life. Check current PTA status before ordering.',
      'Key features include a pro triple-camera system, 120Hz AMOLED display, long battery life and Nothing OS.'
    ),
    (
      'nothing-pakistan-phone-4a',
      'Nothing Phone (4a)',
      'Glyph Bar, Essential AI tools and a triple-camera system. Check current PTA status before ordering.',
      'Key features include the Glyph Bar, Essential AI tools, a triple-camera system and Nothing OS.'
    ),
    (
      'nothing-pakistan-nothing-4a-pro',
      'Nothing Phone (4a) Pro',
      'Ultra-zoom Sony camera, Glyph Bar and Essential AI tools. Check current PTA status before ordering.',
      'Key features include the ultra-zoom Sony camera system, Glyph Bar, Essential AI tools and Nothing OS.'
    ),
    (
      'nothing-pakistan-cmf-phone-1',
      'CMF Phone 1',
      '120Hz AMOLED, Dimensity 7200 Pro 5G and modular design. Check current PTA status before ordering.',
      'Key features include a 120Hz AMOLED display, Dimensity 7200 Pro 5G, a 5000mAh battery and modular design.'
    ),
    (
      'nothing-pakistan-cmf-phone-2-pro',
      'CMF Phone 2 Pro',
      'AMOLED display, versatile camera system and refined modular CMF design for buyers in Pakistan.',
      'Key features include an AMOLED display, a versatile camera system, strong battery life and refined CMF design.'
    )
)
update public.mobiles as mobile
set
  meta_description = mobile_copy.seo_name || ' is Rs ' ||
    to_char(mobile."Price", 'FM999,999,999') || ' in Pakistan. ' ||
    mobile_copy.meta_tail,
  seo_description_long = mobile_copy.seo_name || ' is available in Pakistan at Rs ' ||
    to_char(mobile."Price", 'FM999,999,999') ||
    ' from Nothing Pakistan (SECP registered, CUIN 0337422). ' ||
    mobile_copy.answer_tail ||
    ' PTA approval and non-PTA availability can vary by stock batch, so confirm the current status before purchase. Nationwide delivery, cash on delivery in supported locations, WhatsApp support and Garden Town, Lahore pickup are available.',
  updated_at = now()
from mobile_copy
where mobile.slug = mobile_copy.slug;

with product_copy(slug, seo_name, meta_tail, answer_tail) as (
  values
    (
      'nothing-pakistan-ear-3',
      'Nothing Ear (3)',
      'Super Mic noise control, premium sound and Nothing integration with nationwide ordering support.',
      'Key features include Super Mic noise control, premium sound, active noise cancellation and Nothing device integration.'
    ),
    (
      'nothing-pakistan-ear-a',
      'Nothing Ear (a)',
      'Transparent design, active noise cancellation and strong everyday value with nationwide delivery.',
      'Key features include transparent Nothing design, active noise cancellation, clear wireless audio and a compact charging case.'
    ),
    (
      'nothing-pakistan-ear-open',
      'Nothing Ear (open)',
      'Open-ear comfort, clear wireless audio and Nothing design with Pakistan-wide ordering support.',
      'Key features include an open-ear fit, clear wireless audio, comfortable long-session wear and Nothing design.'
    ),
    (
      'nothing-pakistan-cmf-buds-pro-2',
      'CMF Buds Pro 2',
      'Advanced ANC, detailed wireless audio and long battery life with WhatsApp ordering support.',
      'Key features include advanced active noise cancellation, detailed wireless audio and long battery life.'
    ),
    (
      'nothing-pakistan-cmf-buds-2',
      'CMF Buds 2',
      'Clear wireless audio, active noise cancellation and a comfortable fit with nationwide delivery.',
      'Key features include clear wireless audio, active noise cancellation, a comfortable fit and long battery life.'
    ),
    (
      'nothing-pakistan-cmf-buds-2-plus',
      'CMF Buds 2 Plus',
      'Adaptive noise cancellation, spatial audio features and long battery life for buyers in Pakistan.',
      'Key features include adaptive noise cancellation, spatial audio features, clear calls and long battery life.'
    ),
    (
      'nothing-pakistan-cmf-buds-2a',
      'CMF Buds 2a',
      'Affordable CMF wireless earbuds with noise control and long battery life for everyday listening.',
      'Key features include affordable wireless audio, noise control, a comfortable fit and long battery life.'
    ),
    (
      'nothing-pakistan-headphone-1',
      'Nothing Headphone (1)',
      'KEF-tuned sound, active noise cancellation and long battery life with nationwide ordering support.',
      'Key features include KEF-tuned sound, active noise cancellation, long battery life, USB-C and 3.5mm connectivity.'
    ),
    (
      'nothing-pakistan-headphone-a',
      'Nothing Headphone (a)',
      'Long battery life, active noise cancellation and a comfortable over-ear fit for buyers in Pakistan.',
      'Key features include long battery life, active noise cancellation, a comfortable over-ear fit and USB-C charging.'
    ),
    (
      'nothing-pakistan-cmf-power-140w-gan',
      'CMF Power 140W GaN',
      '140W multi-device GaN fast charging for phones, tablets and laptops with nationwide delivery.',
      'This compact multi-port GaN charger supports up to 140W fast charging for compatible phones, tablets and laptops.'
    ),
    (
      'nothing-pakistan-cmf-power-100w-gan',
      'CMF Power 100W GaN',
      '100W multi-device GaN fast charging for phones, tablets and laptops with nationwide delivery.',
      'This compact multi-port GaN charger supports up to 100W fast charging for compatible phones, tablets and laptops.'
    ),
    (
      'nothing-pakistan-cmf-power-65w-gan',
      'CMF Power 65W GaN',
      'Compact 65W GaN fast charging for compatible phones, tablets and laptops with nationwide delivery.',
      'This compact GaN charger supports up to 65W fast charging for compatible Nothing and CMF devices, tablets and laptops.'
    ),
    (
      'nothing-pakistan-cmf-watch-pro-2',
      'CMF Watch Pro 2',
      'AMOLED display, GPS and health tracking in a customizable CMF smartwatch for buyers in Pakistan.',
      'Key features include an AMOLED display, GPS, health and fitness tracking, customizable styling and multi-day battery life.'
    ),
    (
      'nothing-pakistan-cmf-watch-3-pro',
      'CMF Watch 3 Pro',
      'AMOLED display, GPS, health tracking and long battery life with nationwide ordering support.',
      'Key features include an AMOLED display, GPS, health and fitness tracking, smart notifications and long battery life.'
    )
)
update public.products as product
set
  meta_description = product_copy.seo_name || ' is Rs ' ||
    to_char(product.price, 'FM999,999,999') || ' in Pakistan. ' ||
    product_copy.meta_tail,
  seo_description_long = product_copy.seo_name || ' is available in Pakistan at Rs ' ||
    to_char(product.price, 'FM999,999,999') ||
    ' from Nothing Pakistan (SECP registered, CUIN 0337422). ' ||
    product_copy.answer_tail ||
    ' Current stock can be confirmed on WhatsApp. Nationwide delivery, cash on delivery in supported locations and Garden Town, Lahore pickup are available.',
  updated_at = now()
from product_copy
where product.slug = product_copy.slug;
