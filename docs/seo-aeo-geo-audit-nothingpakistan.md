# nothingpakistan.pk SEO, AEO, GEO Audit

Date: 2026-06-05

## Executive Summary

nothingpakistan.pk already has a strong SEO foundation: dynamic metadata, product and collection routes, Supabase-backed catalog data, sitemap generation, robots routes, product schema, FAQ schema, blog article schema, contact schema, and support pages. This pass focused on technical fixes that can ship in code and content improvements that help Google Search, Google AI Overviews, ChatGPT, Gemini, Perplexity, Claude, and Copilot understand the site as the Nothing Pakistan storefront for Nothing and CMF by Nothing products.

Implemented in this pass:

- Added a homepage SEO/AEO content section with one H1, keyword-rich H2 sections, answer blocks, category internal links, trust links, buying guidance, and FAQ tabs.
- Added homepage FAQPage JSON-LD using existing homepage FAQ data and concise answer blocks.
- Fixed prefixed category slugs so `nothing-pakistan-phones`, `nothing-pakistan-chargers`, and related category pages receive the correct layout, FAQ schema, metadata behavior, and sitemap priority.
- Added ecommerce robots disallows for cart, checkout, account, search, and dashboard routes.
- Added Review and AggregateRating schema enrichment to mobile product pages when review data exists.
- Confirmed the homepage source has one H1.
- Confirmed TypeScript passes.

## Technical SEO Audit

### Title Tags

Status: Good with improvements.

The app uses Next.js metadata across homepage, collections, products, blog, support, contact, authenticity, author, and policy pages. Product and collection pages generate metadata from Supabase catalog rows. Homepage now targets `Nothing Pakistan | Phones, CMF, Chargers & Earbuds`.

Recommendation: Keep product title fields unique in Supabase. Avoid using the same title template for every accessory if the product type and model are different.

### Meta Descriptions

Status: Good with ongoing content dependency.

Product, mobile, collection, blog, and support pages use generated or stored descriptions. Homepage and category descriptions are present.

Recommendation: Keep descriptions under roughly 150 to 160 characters where possible, include Pakistan purchase intent, and avoid repeated boilerplate.

### H1 Tags

Status: Fixed for homepage.

Homepage now has one H1 focused on Nothing Pakistan. Collection and product templates also render visible H1s.

Recommendation: During future page creation, keep one primary H1 per page and use H2/H3 for supporting sections.

### Duplicate and Thin Content

Status: Partially addressed.

Homepage received richer unique content. Collection pages already render intro content, answer sections, FAQs, product grids, and internal links. Product descriptions are mostly Supabase-driven and should remain unique.

Recommendation: Prioritize expanding thin product rows in Supabase where descriptions are short or overly templated.

### Image Alt Tags

Status: Mixed.

Product media uses catalog alt text where available. Some decorative campaign images intentionally use empty alt text. Product images should continue using descriptive alt text such as `Nothing Phone 3 available in Pakistan`.

Recommendation: Audit Supabase `images.alt_text` quarterly and keep image file names descriptive.

### Internal Linking

Status: Improved.

Homepage now links to phones, CMF, audio, chargers, accessories, protectors, support, contact, policies, and ordering routes. Collection pages link to products and trust routes. Blog posts link to products and collections.

Recommendation: Add contextual links inside new blog content to at least two product pages and two category pages.

### Broken Links and Redirects

Status: Build verified, live crawl not performed.

The build generated product paths using `nothing-pakistan-...` handles. A full live crawler should be run after deployment against production to catch external 404s or stale indexed paths.

Recommendation: Keep the primary storefront, canonical tags, sitemap URLs, structured data, and internal links on `www.nothingpakistan.pk`.

### Canonical URLs

Status: Good.

The app generates canonical metadata. Supabase product and mobile canonical URLs were previously aligned with prefixed slugs. Category pages use self-referencing canonical URLs from catalog data or route fallback.

Recommendation: Ensure new Supabase rows store canonical URLs on `https://www.nothingpakistan.pk`.

### Open Graph and Twitter Cards

Status: Good.

Homepage, collection, product, blog, support, and contact pages include OG/Twitter metadata patterns.

Recommendation: Keep OG images stable, inspectable, and brand-specific.

### Robots and Sitemap

Status: Improved.

Robots now allows public catalog/content routes and disallows non-indexable commerce/admin patterns. Sitemap generation includes homepage, static pages, policies, support pages, blogs, collections, and products.

Recommendation: Submit `https://www.nothingpakistan.pk/sitemap.xml` in Google Search Console and Bing Webmaster Tools after deployment.

## Schema Implementation

Implemented or present:

- Homepage: Organization/OnlineStore, WebSite, FAQPage.
- Collection pages: CollectionPage, ItemList, BreadcrumbList, FAQPage where FAQs exist.
- Product pages: Product, Offer, BreadcrumbList, FAQPage, AggregateRating and Review when data exists.
- Blog posts: Article, BreadcrumbList, FAQPage.
- Contact page: ContactPage with organization/contact data.

Recommendation: Add verified aggregate ratings only when real review counts exist. Avoid fabricated review markup.

## AEO and GEO Report

The homepage now includes concise 40 to 80 word answer blocks for major questions:

- What is Nothing Pakistan?
- Where can I buy official Nothing products in Pakistan?
- Is Nothing Pakistan an authorized Nothing retailer?
- What is the latest Nothing Phone in Pakistan?

The site also uses structured headings, entity names, organization data, product entities, FAQ schema, author pages, company verification pages, and internal support routes. This helps answer engines identify who operates the site, what it sells, where it serves, and how customers can buy or get support.

Recommendation: Add the same answer-block pattern to future major landing pages and blog posts.

## Internal Linking Plan

Homepage:

- Link to Phones, CMF, Audio, Chargers, Accessories, Protectors, Contact, Support Centre, Company Verification, Shipping, Returns, and Order pages.

Collections:

- Link category pages to product pages.
- Link parent categories to child categories.
- Link all major collections to support and trust routes.

Products:

- Link phones to compatible chargers, protectors, earbuds, and covers.
- Link accessories back to compatible phone models.
- Link each product page to FAQs, support, delivery, and return policy.

Blogs:

- Link every buying guide to at least two products.
- Link every comparison post to relevant collection pages.
- Link warranty/support topics to Contact, Support Centre, Company Verification, and policies.

## 3-Month Content Strategy

Month 1:

- Nothing Phone price in Pakistan guide.
- Nothing Phone 3 vs Phone 3a comparison.
- Best Nothing chargers in Pakistan.
- CMF by Nothing buying guide for Pakistan.
- Nothing Ear and CMF Buds comparison.
- How to verify original Nothing products in Pakistan.

Month 2:

- Nothing Phone vs Samsung midrange comparison.
- Nothing Phone vs iPhone for design-focused buyers.
- CMF Buds review and buying guide.
- Nothing OS features explained for Pakistani buyers.
- Best Nothing accessories for Phone 3 and Phone 3a.
- Delivery, COD, and warranty guide for Nothing Pakistan customers.

Month 3:

- Latest Nothing Phone launch tracking page.
- Nothing AI features and Essential Space guide.
- Best earbuds for calls and ANC in Pakistan.
- CMF Watch buying guide.
- Nothing charger wattage guide.
- Student and offer-focused buying guide.

Publishing target: 2 to 3 posts per week, 1500 to 2500 words each, with FAQ schema, product links, category links, original screenshots/images where possible, and a concise answer block near the top.

## External Setup Checklist

These require account access outside the codebase:

- Submit sitemap in Google Search Console.
- Submit sitemap in Bing Webmaster Tools.
- Configure GA4.
- Configure Microsoft Clarity.
- Create or update Google Business Profile.
- Add verified address, phone, hours, product photos, and website.
- Monitor Search Console indexing, CTR, query coverage, and page experience.
- Track AI visibility manually across ChatGPT, Gemini, Perplexity, Claude, Copilot, and Google AI Overviews.

## Residual Risks

- Live Core Web Vitals were not measured in this code pass. Run Lighthouse/PageSpeed Insights after deployment.
- Some external media comes from third-party CDNs. Keep monitoring LCP and image optimization.
- Claims such as official partner or authorized retailer should match real commercial/legal documentation before being used in paid campaigns or official submissions.
