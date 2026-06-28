# nothingpakistan.pk — Complete SEO & AEO Fix Prompts
Solve these issues but solve one by one 

## ISSUE 1 — CRITICAL: Add JSON-LD Structured Data to All Product Pages

### What is broken
Every product page (e.g. /products/nothing-pakistan-phone-3) has zero JSON-LD schema. This means:
- ChatGPT, Gemini, and Perplexity cannot read your prices, availability, or FAQ answers
- Google cannot show rich results (price badge, availability, ratings) in search
- AI engines cite PriceOye and CellMart instead of you because those sites have schema

### Developer Prompt

```
You are working on a Next.js e-commerce site at https://www.nothingpakistan.pk built with Next.js App Router and Supabase.

TASK: Add JSON-LD structured data to every product page.

Each product page lives at /products/[slug] and is rendered from a Next.js dynamic route. The product data (name, price, slug, image, description) comes from Supabase.

Add the following three JSON-LD blocks inside the <head> of every product page using Next.js Metadata API or a <Script> component placed in the page layout:

1. PRODUCT + OFFER SCHEMA
Replace the placeholder values with dynamic data from your product record:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[product.name]",
  "brand": { "@type": "Brand", "name": "Nothing" },
  "description": "[product.description]",
  "image": "[product.image_url]",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "PKR",
    "price": "[product.price]",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://www.nothingpakistan.pk/products/[product.slug]",
    "seller": {
      "@type": "Organization",
      "name": "Nothing Pakistan",
      "url": "https://www.nothingpakistan.pk"
    }
  }
}
</script>

2. FAQPAGE SCHEMA
Pull the top 20 FAQ questions and answers for this product from Supabase (or hardcode them per product if not in DB). This is critical for AI engines like ChatGPT and Gemini to cite your answers.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the price of [product.name] in Pakistan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[product.name] is priced at Rs [product.price] in Pakistan from Nothing Pakistan (nothingpakistan.pk), an SECP-registered official store (CUIN 0337422) with nationwide delivery and WhatsApp support."
      }
    },
    {
      "@type": "Question",
      "name": "Is [product.name] PTA approved in Pakistan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PTA-approved [product.name] models are available at Nothing Pakistan. Contact via WhatsApp at +923424476070 for current PTA and non-PTA pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Where can I buy [product.name] in Pakistan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[product.name] can be purchased from nothingpakistan.pk, operated by NOTHING PAKISTAN (SMC-PRIVATE) LIMITED (CUIN 0337422). Orders ship nationwide with cash on delivery. Store pickup available in Garden Town, Lahore."
      }
    },
    {
      "@type": "Question",
      "name": "Does Nothing Pakistan deliver [product.name] across Pakistan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Nothing Pakistan delivers [product.name] to Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and other cities across Pakistan. Cash on delivery is available."
      }
    },
    {
      "@type": "Question",
      "name": "Is [product.name] original?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Nothing Pakistan is an SECP-registered company (CUIN 0337422) selling original Nothing and CMF products. Company verification details are available at https://www.nothingpakistan.pk/company-verification."
      }
    }
  ]
}
</script>

3. BREADCRUMB SCHEMA
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.nothingpakistan.pk" },
    { "@type": "ListItem", "position": 2, "name": "[collection.name]", "item": "https://www.nothingpakistan.pk/collections/[collection.slug]" },
    { "@type": "ListItem", "position": 3, "name": "[product.name]", "item": "https://www.nothingpakistan.pk/products/[product.slug]" }
  ]
}
</script>

IMPLEMENTATION NOTES:
- Use Next.js generateMetadata() or a server component to inject these dynamically
- All three blocks can be combined into one @graph array inside a single <script type="application/ld+json"> tag
- Validate the output at https://search.google.com/test/rich-results after deploying
- Do NOT use next/script with strategy="lazyOnload" — use strategy="beforeInteractive" or put it directly in <head>
```

---

## ISSUE 2 — CRITICAL: Add Organization Schema to Homepage and /nothing-pakistan Page

### What is broken
ChatGPT and Gemini need machine-readable proof that Nothing Pakistan is a registered business. Your SECP registration text exists on the page but is not in schema — AI engines cannot read plain text as a verified business identity.

### Developer Prompt

```
You are working on a Next.js site at https://www.nothingpakistan.pk.

TASK: Add Organization JSON-LD schema to two pages:
1. The homepage (app/page.tsx or pages/index.tsx)
2. The /nothing-pakistan page

Add this JSON-LD block inside the <head> of both pages:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nothing Pakistan",
  "legalName": "NOTHING PAKISTAN (SMC-PRIVATE) LIMITED",
  "url": "https://www.nothingpakistan.pk",
  "logo": "https://www.nothingpakistan.pk/_next/static/media/nothing_logo.dac7c8ba.webp",
  "description": "SECP-registered official Nothing and CMF products store in Pakistan. CUIN 0337422. Phones, earbuds, chargers, watches, and accessories with PKR pricing and WhatsApp support.",
  "identifier": {
    "@type": "PropertyValue",
    "name": "SECP CUIN",
    "value": "0337422"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lahore",
    "addressRegion": "Punjab",
    "addressCountry": "PK"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "Urdu"],
    "telephone": "+923424476070",
    "url": "https://wa.me/923424476070"
  },
  "sameAs": ["https://www.nothing.tech"]
}
</script>

ALSO add a WebSite schema on the homepage only:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Nothing Pakistan",
  "url": "https://www.nothingpakistan.pk",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.nothingpakistan.pk/collections/shop-all?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>

Validate at: https://search.google.com/test/rich-results
```

---

## ISSUE 3 — CRITICAL: Clean Product Page Meta Keywords in Supabase

### What is broken
Product pages still have the old 60+ keyword dump in meta keywords. The homepage was fixed correctly — apply the same logic to every product. Each product needs 8–10 keywords specific to THAT product only.

### Supabase SQL Prompt

```sql
-- Run this in your Supabase SQL Editor
-- Adjust column name if yours is different from 'meta_keywords'
-- Adjust table name if yours is different from 'product' or 'mobile'

-- PHONES

UPDATE product SET meta_keywords = 'Nothing Phone 3 price in Pakistan, Nothing Phone 3 Pakistan, buy Nothing Phone 3 Pakistan, Nothing Phone 3 PTA approved, Nothing Phone 3 specs Pakistan, Phone 3 accessories Pakistan, Nothing Pakistan Phone 3, Nothing Phone 3 official store Pakistan'
WHERE slug = 'nothing-pakistan-phone-3';

UPDATE product SET meta_keywords = 'Nothing Phone 4a price in Pakistan, Nothing Phone 4a Pakistan, buy Nothing Phone 4a, Nothing Phone 4a PTA approved, Nothing Phone 4a Glyph Bar, Phone 4a Nothing OS, Nothing Pakistan Phone 4a, Nothing Phone 4a official store Pakistan'
WHERE slug = 'nothing-pakistan-phone-4a';

UPDATE product SET meta_keywords = 'Nothing Phone 4a Pro price in Pakistan, Nothing Phone 4a Pro Pakistan, Nothing Phone 4a Pro 140x zoom, Nothing Phone 4a Pro Sony sensor, Phone 4a Pro PTA approved Pakistan, buy Nothing Phone 4a Pro, Nothing Pakistan Phone 4a Pro'
WHERE slug = 'nothing-pakistan-phone-4a-pro';

UPDATE product SET meta_keywords = 'Nothing Phone 3a price in Pakistan, Nothing Phone 3a Pakistan, buy Nothing Phone 3a, Nothing Phone 3a PTA approved, Nothing Phone 3a 20GB RAM, Nothing Phone 3a 2 day battery, Nothing Pakistan Phone 3a'
WHERE slug = 'nothing-pakistan-phone-3a';

UPDATE product SET meta_keywords = 'Nothing Phone 3a Pro price in Pakistan, Nothing Phone 3a Pro Pakistan, buy Nothing Phone 3a Pro, Phone 3a Pro camera system, Nothing Phone 3a Pro PTA approved, Nothing Pakistan Phone 3a Pro'
WHERE slug = 'nothing-pakistan-phone-3a-pro';

UPDATE product SET meta_keywords = 'Nothing Phone 3a Lite price in Pakistan, Nothing Phone 3a Lite Pakistan, buy Nothing Phone 3a Lite, Nothing Phone 3a Lite PTA, Nothing Phone 3a Lite specs, Nothing Pakistan Phone 3a Lite'
WHERE slug = 'nothing-pakistan-phone-3a-lite';

UPDATE product SET meta_keywords = 'Nothing Phone 2a price in Pakistan, Nothing Phone 2a Pakistan, buy Nothing Phone 2a, Nothing Phone 2a PTA approved, Nothing Phone 2a specs, Nothing Pakistan Phone 2a'
WHERE slug = 'nothing-pakistan-phone-2a';

UPDATE product SET meta_keywords = 'Nothing Phone 2a Plus price in Pakistan, Nothing Phone 2a Plus Pakistan, buy Nothing Phone 2a Plus, Nothing Phone 2a Plus PTA, Nothing Pakistan Phone 2a Plus'
WHERE slug = 'nothing-pakistan-phone-2a-plus';

UPDATE product SET meta_keywords = 'Nothing Phone 3 price in Pakistan, Nothing Phone 3 Pakistan, buy Nothing Phone 3 Pakistan, Nothing Phone 3 PTA approved, Nothing Phone 3 camera, Nothing Phone 3 official'
WHERE slug = 'nothing-pakistan-phone-3';

UPDATE product SET meta_keywords = 'CMF Phone 1 price in Pakistan, CMF Phone 1 Pakistan, buy CMF Phone 1, CMF Phone 1 5G Pakistan, CMF Phone 1 AMOLED, CMF Phone 1 PTA approved, CMF by Nothing Pakistan, Nothing Pakistan CMF Phone 1'
WHERE slug = 'nothing-pakistan-cmf-phone-1';

UPDATE product SET meta_keywords = 'CMF Phone 2 Pro price in Pakistan, CMF Phone 2 Pro Pakistan, buy CMF Phone 2 Pro, CMF Phone 2 Pro 50W charging, CMF Phone 2 Pro PTA, CMF by Nothing Phone 2 Pro Pakistan'
WHERE slug = 'nothing-pakistan-cmf-phone-2-pro';

-- EARBUDS

UPDATE product SET meta_keywords = 'Nothing Ear 3 price in Pakistan, Nothing Ear 3 Pakistan, buy Nothing Ear 3, Nothing Ear 3 ANC, Nothing Ear 3 Pakistan price, Nothing earbuds Pakistan'
WHERE slug = 'nothing-pakistan-ear-3';

UPDATE product SET meta_keywords = 'Nothing Ear a price in Pakistan, Nothing Ear a Pakistan, buy Nothing Ear a, Nothing Ear a specs, Nothing earbuds Pakistan, Nothing Ear a official store'
WHERE slug = 'nothing-pakistan-ear-a';

UPDATE product SET meta_keywords = 'Nothing Ear open price in Pakistan, Nothing Ear open Pakistan, buy Nothing Ear open, open ear earbuds Pakistan, Nothing Ear open specs'
WHERE slug = 'nothing-pakistan-ear-open';

UPDATE product SET meta_keywords = 'CMF Buds 2 Pro price in Pakistan, CMF Buds 2 Pro Pakistan, buy CMF Buds 2 Pro, CMF Buds 2 Pro ANC, CMF earbuds Pakistan'
WHERE slug = 'nothing-pakistan-cmf-buds-pro-2';

UPDATE product SET meta_keywords = 'CMF Buds 2 price in Pakistan, CMF Buds 2 Pakistan, buy CMF Buds 2, CMF Buds 2 specs, CMF earbuds Pakistan, Nothing Pakistan CMF Buds 2'
WHERE slug = 'nothing-pakistan-cmf-buds-2';

UPDATE product SET meta_keywords = 'CMF Buds 2 Plus price in Pakistan, CMF Buds 2 Plus Pakistan, buy CMF Buds 2 Plus, CMF Buds 2 Plus ANC, CMF earbuds Pakistan'
WHERE slug = 'nothing-pakistan-cmf-buds-2-plus';

UPDATE product SET meta_keywords = 'CMF Buds 2a price in Pakistan, CMF Buds 2a Pakistan, buy CMF Buds 2a, affordable earbuds Pakistan, CMF by Nothing earbuds'
WHERE slug = 'nothing-pakistan-cmf-buds-2a';

-- HEADPHONES

UPDATE product SET meta_keywords = 'Nothing Headphone 1 price in Pakistan, Nothing Headphone 1 Pakistan, buy Nothing Headphone 1, Nothing Headphone 1 KEF, Nothing headphones Pakistan'
WHERE slug = 'nothing-pakistan-headphone-1';

UPDATE product SET meta_keywords = 'Nothing Headphone a price in Pakistan, Nothing Headphone a Pakistan, buy Nothing Headphone a, Nothing Headphone a Charli xcx, Nothing headphones Pakistan'
WHERE slug = 'nothing-pakistan-headphone-a';

-- CHARGERS

UPDATE product SET meta_keywords = 'CMF Power 140W GaN price in Pakistan, CMF Power 140W GaN Pakistan, buy CMF Power 140W, GaN charger 140W Pakistan, Nothing charger Pakistan'
WHERE slug = 'nothing-pakistan-cmf-power-140w-gan';

UPDATE product SET meta_keywords = 'CMF Power 100W GaN price in Pakistan, CMF Power 100W GaN Pakistan, buy CMF Power 100W, GaN charger 100W Pakistan, Nothing charger 100W Pakistan'
WHERE slug = 'nothing-pakistan-cmf-power-100w-gan';

UPDATE product SET meta_keywords = 'CMF Power 65W GaN price in Pakistan, CMF Power 65W GaN Pakistan, buy CMF Power 65W, GaN charger 65W Pakistan, Nothing 65W charger Pakistan'
WHERE slug = 'nothing-pakistan-cmf-power-65w-gan';

-- WATCHES

UPDATE product SET meta_keywords = 'CMF Watch Pro 2 price in Pakistan, CMF Watch Pro 2 Pakistan, buy CMF Watch Pro 2, CMF smartwatch Pakistan, Nothing Watch Pakistan'
WHERE slug = 'nothing-pakistan-cmf-watch-pro-2';

UPDATE product SET meta_keywords = 'CMF Watch 3 Pro price in Pakistan, CMF Watch 3 Pro Pakistan, buy CMF Watch 3 Pro, CMF smartwatch Pakistan, Nothing smartwatch Pakistan'
WHERE slug = 'nothing-pakistan-cmf-watch-3-pro';

-- ALSO RUN ON MOBILE TABLE (adjust column/table names as needed)
UPDATE mobile SET meta_keywords = 'Nothing Phone 3 price in Pakistan, Nothing Phone 3 Pakistan, buy Nothing Phone 3 Pakistan, Nothing Phone 3 PTA approved, Nothing Phone 3 official store Pakistan'
WHERE slug = 'nothing-pakistan-phone-3' OR model_name ILIKE '%Phone (3)%';

UPDATE mobile SET meta_keywords = 'Nothing Phone 4a price in Pakistan, Nothing Phone 4a Pakistan, buy Nothing Phone 4a, Nothing Phone 4a PTA approved, Nothing Phone 4a Glyph Bar'
WHERE slug = 'nothing-pakistan-phone-4a' OR model_name ILIKE '%Phone (4a)%';

UPDATE mobile SET meta_keywords = 'Nothing Phone 4a Pro price in Pakistan, Nothing Phone 4a Pro Pakistan, Nothing Phone 4a Pro 140x zoom, Phone 4a Pro Sony sensor, Nothing Phone 4a Pro PTA approved'
WHERE slug = 'nothing-pakistan-phone-4a-pro' OR model_name ILIKE '%Phone (4a) Pro%';

UPDATE mobile SET meta_keywords = 'Nothing Phone 3a price in Pakistan, Nothing Phone 3a Pakistan, Nothing Phone 3a 20GB RAM, Nothing Phone 3a 2 day battery, Nothing Phone 3a PTA approved'
WHERE slug = 'nothing-pakistan-phone-3a' OR model_name ILIKE '%Phone (3a)%';
```

---

## ISSUE 4 — WARNING: Update Product Page H1 Tags to Include Keywords + Price

### What is broken
Every product page H1 is just the short product name: "Phone (3)", "Phone (4a) Pro" etc. H1 is one of the strongest on-page SEO signals. "Phone (3)" has zero search value. Competitors like PriceOye use "Nothing Phone (3) Price in Pakistan" as their H1 — and they outrank you partly because of this.

### Developer Prompt

```
You are working on a Next.js site at https://www.nothingpakistan.pk.

TASK: Update the H1 tag on every product page to include the full product name, "Price in Pakistan", and the PKR price.

The current H1 on product pages renders as just: <h1>Phone (3)</h1>

Change the product page template so the H1 renders as:
<h1>Nothing Phone (3) — Price in Pakistan | Rs 328,999</h1>

The pattern is:
<h1>[Brand] [Product Full Name] — Price in Pakistan | Rs [price]</h1>

Where:
- [Brand] = "Nothing" for Nothing phones, "CMF" for CMF phones, "Nothing" for earbuds/headphones/chargers
- [Product Full Name] = product.name from your Supabase product record
- [price] = product.price formatted with commas (e.g. 328,999)

Examples:
- Nothing Phone (3) — Price in Pakistan | Rs 328,999
- Nothing Phone (4a) Pro — Price in Pakistan | Rs 243,999
- CMF Phone 1 — Price in Pakistan | Rs 79,999
- Nothing Ear (3) — Price in Pakistan | Rs 18,999
- CMF Buds 2 Pro — Price in Pakistan | Rs 15,999
- CMF Power 140W GaN — Price in Pakistan | Rs 19,999

This is a template change — one fix in your product page component updates all product pages automatically.

Keep the visual styling the same — only change the text content of the H1.
```

---

## ISSUE 5 — WARNING: Update Product Meta Descriptions to Be Unique Per Product

### What is broken
All product meta descriptions follow the same template: "[Product] price in Pakistan at Rs X. Review PTA status, non-PTA price, specs, stock, delivery, warranty support, and compatible Nothing accessories from Nothing Pakistan." Every product says nearly the same thing. Google treats these as near-duplicates and deprioritises them.

### Supabase SQL Prompt

```sql
-- Run in Supabase SQL Editor
-- Unique meta descriptions per product — each highlights the product's #1 feature

UPDATE product SET meta_description = 'Nothing Phone (3) is Rs 328,999 in Pakistan. Four 50MP cameras, new Glyph Interface, Nothing OS 4.0. PTA approved. SECP-registered Nothing Pakistan — WhatsApp support and nationwide delivery.'
WHERE slug = 'nothing-pakistan-phone-3';

UPDATE product SET meta_description = 'Nothing Phone (4a) is Rs 175,999 in Pakistan. New Glyph Bar for live delivery updates, Essential AI notifications, Nothing OS. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-4a';

UPDATE product SET meta_description = 'Nothing Phone (4a) Pro is Rs 243,999 in Pakistan. World first 140x ultra-zoom triple camera with Sony sensor. PTA approved. SECP-registered Nothing Pakistan — nationwide delivery.'
WHERE slug = 'nothing-pakistan-phone-4a-pro';

UPDATE product SET meta_description = 'Nothing Phone (3a) is Rs 149,999 in Pakistan. 2-day battery, 20GB RAM booster, dual 50MP cameras, Nothing OS. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-3a';

UPDATE product SET meta_description = 'Nothing Phone (3a) Pro is Rs 182,999 in Pakistan. Pro triple camera system, 2-day battery, 20GB RAM. PTA approved. Buy from SECP-registered Nothing Pakistan with WhatsApp support.'
WHERE slug = 'nothing-pakistan-phone-3a-pro';

UPDATE product SET meta_description = 'Nothing Phone (3a) Lite is Rs 111,999 in Pakistan. Solid display, long battery life, clean Nothing OS. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-3a-lite';

UPDATE product SET meta_description = 'Nothing Phone (2a) is Rs 115,999 in Pakistan. 2-day battery, 20GB RAM, dual 50MP cameras, Dimensity 7200 Pro. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-2a';

UPDATE product SET meta_description = 'Nothing Phone (2a) Plus is Rs 139,999 in Pakistan. Upgraded performance, 2-day battery, 50MP cameras. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-2a-plus';

UPDATE product SET meta_description = 'CMF Phone 1 is Rs 79,999 in Pakistan. 120Hz AMOLED, Dimensity 7200 Pro 5G, 5000mAh battery, modular design. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-cmf-phone-1';

UPDATE product SET meta_description = 'CMF Phone 2 Pro is Rs 99,999 in Pakistan. Upgraded AMOLED display, 50W fast charging, refined CMF modular design. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-cmf-phone-2-pro';

UPDATE product SET meta_description = 'Nothing Ear (3) is Rs 18,999 in Pakistan. Super Mic noise cancellation, premium sound, Nothing OS integration. Buy from SECP-registered Nothing Pakistan with WhatsApp support.'
WHERE slug = 'nothing-pakistan-ear-3';

UPDATE product SET meta_description = 'Nothing Ear (a) earbuds are Rs 14,999 in Pakistan. Transparent design, ANC, great value. Buy from SECP-registered Nothing Pakistan with nationwide delivery.'
WHERE slug = 'nothing-pakistan-ear-a';

UPDATE product SET meta_description = 'Nothing Headphone (1) is Rs 64,999 in Pakistan. Custom sound tuned by KEF, up to 80hr battery. Buy from SECP-registered Nothing Pakistan with WhatsApp support.'
WHERE slug = 'nothing-pakistan-headphone-1';

UPDATE product SET meta_description = 'Nothing Headphone (a) is Rs 34,999 in Pakistan. 5-day battery life tested by Charli xcx. Buy from SECP-registered Nothing Pakistan with WhatsApp support.'
WHERE slug = 'nothing-pakistan-headphone-a';

UPDATE product SET meta_description = 'CMF Buds 2 Pro are Rs 15,999 in Pakistan. Advanced ANC, Hi-Res Audio, long battery life. Buy from SECP-registered Nothing Pakistan with nationwide delivery.'
WHERE slug = 'nothing-pakistan-cmf-buds-pro-2';

UPDATE product SET meta_description = 'CMF Buds 2 are Rs 15,999 in Pakistan. Clear audio, ANC, comfortable fit, long battery. Buy from SECP-registered Nothing Pakistan with WhatsApp support.'
WHERE slug = 'nothing-pakistan-cmf-buds-2';

UPDATE product SET meta_description = 'CMF Power 140W GaN charger is Rs 19,999 in Pakistan. Fastest Nothing charger — 140W GaN for phones and laptops. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-cmf-power-140w-gan';

UPDATE product SET meta_description = 'CMF Power 100W GaN charger is Rs 18,199 in Pakistan. 100W GaN multi-device fast charging. Buy from SECP-registered Nothing Pakistan with WhatsApp support.'
WHERE slug = 'nothing-pakistan-cmf-power-100w-gan';

UPDATE product SET meta_description = 'CMF Power 65W GaN charger is Rs 5,499 in Pakistan. Compact 65W GaN — fast charge your Nothing phone, laptop, or tablet. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-cmf-power-65w-gan';

UPDATE product SET meta_description = 'CMF Watch Pro 2 is Rs 18,999 in Pakistan. Always-on AMOLED, GPS, 5-day battery, health tracking. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-cmf-watch-pro-2';

-- ALSO RUN ON MOBILE TABLE
UPDATE mobile SET meta_description = 'Nothing Phone (3) is Rs 328,999 in Pakistan. Four 50MP cameras, new Glyph Interface, Nothing OS 4.0. PTA approved. SECP-registered Nothing Pakistan — WhatsApp support and nationwide delivery.'
WHERE slug = 'nothing-pakistan-phone-3' OR model_name ILIKE '%Phone (3)%';

UPDATE mobile SET meta_description = 'Nothing Phone (4a) is Rs 175,999 in Pakistan. New Glyph Bar, Essential AI notifications, Nothing OS. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-4a' OR model_name ILIKE '%Phone (4a)%';

UPDATE mobile SET meta_description = 'Nothing Phone (4a) Pro is Rs 243,999 in Pakistan. World first 140x ultra-zoom Sony camera. PTA approved. SECP-registered Nothing Pakistan — nationwide delivery.'
WHERE slug = 'nothing-pakistan-phone-4a-pro' OR model_name ILIKE '%Phone (4a) Pro%';

UPDATE mobile SET meta_description = 'Nothing Phone (3a) is Rs 149,999 in Pakistan. 2-day battery, 20GB RAM, dual 50MP cameras. PTA approved. Buy from SECP-registered Nothing Pakistan.'
WHERE slug = 'nothing-pakistan-phone-3a' OR model_name ILIKE '%Phone (3a)%';
```

---

## ISSUE 6 — WARNING: Update Product Descriptions in Supabase (Answer-First Format)

### What is broken
Product descriptions are either thin or written as marketing copy. AI engines and Google reward descriptions that directly answer buyer questions: price, specs, PTA status, delivery, and who the seller is.

### Supabase SQL Prompt

```sql
-- Run in Supabase SQL Editor
-- Answer-first product descriptions — price + key specs + trust signals

UPDATE product SET description = 'Nothing Phone (3) is available in Pakistan at Rs 328,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: four 50MP cameras, the new Glyph Interface with live notification support, Essential AI tools including Essential Search and Essential Notifications, Nothing OS 4.0 with Android 15, and a high-performance Snapdragon processor. PTA-approved models are available — contact WhatsApp for current PTA and non-PTA pricing. Compatible accessories available on the same page: cover (Rs 1,999), protector, jelly sheet, UV protector, and chargers. Nationwide delivery from Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, and other cities. Cash on delivery available. Store pickup in Garden Town, Lahore.'
WHERE slug = 'nothing-pakistan-phone-3';

UPDATE product SET description = 'Nothing Phone (4a) is available in Pakistan at Rs 175,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: the new Glyph Bar for live delivery and notification updates, Essential AI notifications, Nothing OS with ChatGPT integration, dual 50MP cameras, and a 5000mAh battery. PTA-approved models available. Contact WhatsApp (+923424476070) for PTA and non-PTA pricing. Nationwide delivery across Pakistan. Cash on delivery available.'
WHERE slug = 'nothing-pakistan-phone-4a';

UPDATE product SET description = 'Nothing Phone (4a) Pro is available at Rs 243,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: world first 140x ultra-zoom triple camera system with Sony sensor, Essential AI tools, Nothing OS with Gemini integration, new Glyph Bar, 5000mAh battery. PTA-approved models in stock. Contact WhatsApp for PTA and non-PTA pricing. Nationwide delivery with cash on delivery across Pakistan.'
WHERE slug = 'nothing-pakistan-phone-4a-pro';

UPDATE product SET description = 'Nothing Phone (3a) is available at Rs 149,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: 2-day battery life, 20GB RAM booster, dual 50MP camera system, 120Hz AMOLED display, Nothing OS. PTA-approved models in stock. Nationwide delivery with cash on delivery from Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, and other cities. WhatsApp support available at +923424476070.'
WHERE slug = 'nothing-pakistan-phone-3a';

UPDATE product SET description = 'Nothing Phone (3a) Pro is available at Rs 182,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: pro-grade triple camera system, 2-day battery, 20GB RAM booster, 120Hz AMOLED display, Nothing OS. PTA-approved models available. Nationwide delivery with cash on delivery across Pakistan. WhatsApp support at +923424476070.'
WHERE slug = 'nothing-pakistan-phone-3a-pro';

UPDATE product SET description = 'Nothing Phone (3a) Lite is available at Rs 111,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: 120Hz AMOLED display, long battery life, dual camera system, clean Nothing OS experience. PTA-approved models available. Nationwide delivery with cash on delivery. WhatsApp support at +923424476070.'
WHERE slug = 'nothing-pakistan-phone-3a-lite';

UPDATE product SET description = 'CMF Phone 1 is available at Rs 79,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: 6.67-inch 120Hz AMOLED display, MediaTek Dimensity 7200 Pro 5G chipset, 5000mAh battery, dual 50MP cameras, modular interchangeable back covers, Nothing OS. PTA-approved models available. Nationwide delivery with cash on delivery across Pakistan. WhatsApp support at +923424476070.'
WHERE slug = 'nothing-pakistan-cmf-phone-1';

UPDATE product SET description = 'Nothing Headphone (1) is available at Rs 64,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: custom sound tuned by KEF, up to 80 hours total battery life, active noise cancellation, Nothing OS integration, USB-C and 3.5mm connectivity. Available at Nothing Pakistan with nationwide delivery and WhatsApp support.'
WHERE slug = 'nothing-pakistan-headphone-1';

UPDATE product SET description = 'Nothing Headphone (a) is available at Rs 34,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Key features: 100-hour total battery life tested by Global Brand Ambassador Charli xcx over 5 consecutive days, active noise cancellation, comfortable over-ear fit, USB-C charging. Nationwide delivery with WhatsApp support.'
WHERE slug = 'nothing-pakistan-headphone-a';

UPDATE product SET description = 'CMF Power 140W GaN charger is available at Rs 19,999 from Nothing Pakistan (SECP registered, CUIN 0337422). The fastest charger in the Nothing lineup — 140W GaN technology supports rapid charging for phones, tablets, and laptops. Multiple ports. Compact design. Compatible with Nothing Phone (3), Phone (4a) Pro, and other USB-C devices. Nationwide delivery with cash on delivery.'
WHERE slug = 'nothing-pakistan-cmf-power-140w-gan';

UPDATE product SET description = 'CMF Power 100W GaN charger is available at Rs 18,199 from Nothing Pakistan (SECP registered, CUIN 0337422). 100W GaN multi-device fast charging for phones, tablets, and laptops. Multiple ports. Compatible with all Nothing and CMF phones. Nationwide delivery with cash on delivery across Pakistan.'
WHERE slug = 'nothing-pakistan-cmf-power-100w-gan';

UPDATE product SET description = 'CMF Power 65W GaN charger is available at Rs 5,499 from Nothing Pakistan (SECP registered, CUIN 0337422). Compact 65W GaN charger — fast charge your Nothing or CMF phone, tablet, or laptop. Best value fast charger in the Nothing lineup. Nationwide delivery with cash on delivery.'
WHERE slug = 'nothing-pakistan-cmf-power-65w-gan';

-- ALSO UPDATE MOBILE TABLE
UPDATE mobile SET description = 'Nothing Phone (3) is available in Pakistan at Rs 328,999 from Nothing Pakistan (SECP registered, CUIN 0337422). Four 50MP cameras, new Glyph Interface, Essential AI tools, Nothing OS 4.0. PTA-approved models available. Nationwide delivery with WhatsApp support at +923424476070.'
WHERE slug = 'nothing-pakistan-phone-3' OR model_name ILIKE '%Phone (3)%';

UPDATE mobile SET description = 'Nothing Phone (4a) is available at Rs 175,999 from Nothing Pakistan (SECP registered, CUIN 0337422). New Glyph Bar, Essential AI, Nothing OS with ChatGPT integration. PTA approved. Nationwide delivery with cash on delivery.'
WHERE slug = 'nothing-pakistan-phone-4a' OR model_name ILIKE '%Phone (4a)%';

UPDATE mobile SET description = 'Nothing Phone (4a) Pro is Rs 243,999 at Nothing Pakistan (SECP registered, CUIN 0337422). World first 140x ultra-zoom Sony camera, Essential AI, Gemini integration. PTA approved. Nationwide delivery.'
WHERE slug = 'nothing-pakistan-phone-4a-pro' OR model_name ILIKE '%Phone (4a) Pro%';

UPDATE mobile SET description = 'Nothing Phone (3a) is Rs 149,999 at Nothing Pakistan (SECP registered, CUIN 0337422). 2-day battery, 20GB RAM, dual 50MP cameras, Nothing OS. PTA approved. Nationwide delivery.'
WHERE slug = 'nothing-pakistan-phone-3a' OR model_name ILIKE '%Phone (3a)%';
```

---

## ISSUE 7 — WARNING: Make Top FAQ Answers Visible in Initial HTML (Not Hidden Behind JS)

### What is broken
All 20 FAQ answers on product pages are hidden behind JavaScript "Read More" accordions. AI engines (ChatGPT, Gemini) and some crawlers only see what is in the initial HTML — they cannot click to expand answers. This means your most valuable answer content (price, PTA status, delivery) is invisible to AI.

### Developer Prompt

```
You are working on a Next.js site at https://www.nothingpakistan.pk.

TASK: On every product page, make the top 5 FAQ answers visible in the initial HTML render without requiring a JavaScript click to expand.

Current behaviour: All FAQ items are in collapsed accordions that require a user click to show the answer. AI crawlers and some search bots cannot see collapsed content.

Required behaviour: The FIRST 5 FAQ items on each product page should have their answers visible (expanded) by default in the initial server-rendered HTML. Items 6–20 can remain as collapsible accordions.

The top 5 questions to show expanded by default on every product page are:
1. "What is the price of [Product] in Pakistan?"
2. "Where can I buy [Product] in Pakistan?"
3. "Is [Product] PTA approved?"
4. "Does Nothing Pakistan deliver [Product] across Pakistan?"
5. "Is [Product] original?"

Implementation options (choose one):
A. Set the first 5 FAQ items to render with open={true} by default in your React component
B. Use a CSS-only accordion (details/summary or CSS :checked trick) so the HTML is visible without JS
C. Add the FAQPage JSON-LD schema (see Issue 1 prompt) — this is the easiest fix because you don't need to change the UI at all. The JSON-LD gives AI engines the Q&A pairs directly even if the UI accordion stays closed.

RECOMMENDATION: Option C is fastest. Just add FAQPage JSON-LD schema from the Issue 1 prompt — that alone fixes the AI visibility problem without any UI changes.
```

---

## ISSUE 8 — INFO: Submit Sitemap and Request Indexing in Google Search Console

### What to do (no code needed — do this manually)

```
STEP BY STEP ACTIONS IN GOOGLE SEARCH CONSOLE:

1. Go to: https://search.google.com/search-console
   Log in with the Google account that owns nothingpakistan.pk

2. SUBMIT SITEMAP:
   Left menu → Sitemaps
   Enter: https://www.nothingpakistan.pk/sitemap.xml
   Click Submit
   (If your sitemap is at a different URL, check /sitemap_index.xml or your Next.js config)

3. REQUEST INDEXING FOR KEY PAGES:
   Left menu → URL Inspection
   Paste each of these URLs one at a time and click "Request Indexing":
   - https://www.nothingpakistan.pk/
   - https://www.nothingpakistan.pk/nothing-pakistan
   - https://www.nothingpakistan.pk/nothing-phones-pakistan
   - https://www.nothingpakistan.pk/cmf-by-nothing-pakistan
   - https://www.nothingpakistan.pk/products/nothing-pakistan-phone-3
   - https://www.nothingpakistan.pk/products/nothing-pakistan-phone-4a
   - https://www.nothingpakistan.pk/products/nothing-pakistan-phone-4a-pro
   - https://www.nothingpakistan.pk/products/nothing-pakistan-phone-3a
   - https://www.nothingpakistan.pk/products/nothing-pakistan-cmf-phone-1

4. CHECK FOR ERRORS:
   Left menu → Pages
   Look for "Not indexed" pages and fix any that should be indexed

5. DO THIS AFTER EVERY MAJOR UPDATE to force Google to re-crawl quickly
   instead of waiting weeks for the natural crawl schedule
```

---

## ISSUE 9 — INFO: Build Backlinks From Pakistani Tech Media

### What to do (no code needed — outreach task)

```
BACKLINK OUTREACH PLAN — Do this within 2 weeks:

PRIORITY 1 — Press release to tech media (highest impact):
Angle: "Pakistan's First SECP-Registered Nothing Official Store Launches at nothingpakistan.pk"
Key facts to include:
- NOTHING PAKISTAN (SMC-PRIVATE) LIMITED, CUIN 0337422
- Official SECP registered Pakistani company
- First and only legally registered Nothing store in Pakistan
- Garden Town, Lahore physical pickup location
- Nationwide delivery with WhatsApp support

Submit to:
- TechJuice.com → submit@techjuice.com (or use contact form)
- ProPakistani.pk → newsroom@propakistani.pk
- PhoneWorld.com.pk → contact form on site
- WhatMobile.com.pk → contact form on site

PRIORITY 2 — Get listed on price comparison sites:
- WhatMobile Pakistan: https://www.whatmobile.com.pk (submit your store as a retailer)
- PhoneWorld Pakistan: https://www.phoneworld.com.pk (contact to add as official retailer)
- Priceoye.pk: https://priceoye.pk (contact to be listed as authorized dealer)

PRIORITY 3 — Social media and forum links:
- Post in r/pakistan subreddit about Nothing products (with link to your store)
- Post in Pakistani tech Facebook groups
- Post on Twitter/X Pakistan tech community with #NothingPakistan

PRIORITY 4 — Ask for a link from Nothing Technology:
Email: press@nothing.tech
Ask to be listed on nothing.tech as the official Pakistan partner/reseller.
A single dofollow link from nothing.tech would massively boost your authority.

WHY THIS MATTERS:
PriceOye, CellMart, and Fonepro outrank you not because their pages are better —
it is because they have more backlinks from Pakistani tech media.
One article on TechJuice with a link to your store is worth more than
100 on-page SEO changes combined.
```

---

## VALIDATION CHECKLIST

After completing all fixes, verify each one:

| Fix | How to verify |
|-----|--------------|
| JSON-LD schema | https://search.google.com/test/rich-results |
| Organization schema | https://validator.schema.org |
| Meta keywords cleaned | View source on product page, check meta keywords tag |
| H1 updated | View source, search for `<h1>` |
| Meta descriptions unique | Google: site:nothingpakistan.pk — check snippets |
| FAQ answers visible | View source, search for FAQ answer text |
| Sitemap submitted | Google Search Console → Sitemaps |
| Indexing requested | Google Search Console → URL Inspection |

---

## EXPECTED RESULTS TIMELINE

| Action | Expected impact | Timeframe |
|--------|----------------|-----------|
| JSON-LD Product + FAQ schema | Google rich results, AI engine citations | 2–4 weeks |
| Organization schema | AI engines cite you as registered business | 2–3 weeks |
| Meta keywords cleaned | Crawl efficiency improvement | 1–2 weeks |
| H1 updated | Keyword ranking improvement | 3–6 weeks |
| Meta descriptions unique | Better CTR in search results | 2–4 weeks |
| Sitemap submitted | Faster indexing of new pages | 3–7 days |
| Backlinks from TechJuice | Domain authority boost, ranking jump | 4–8 weeks |
| Link from nothing.tech | Major authority and trust signal | 2–6 weeks |

---

*Document generated for nothingpakistan.pk — Nothing Pakistan (SMC-Private) Limited — CUIN 0337422*
*Audit: June 2026*
