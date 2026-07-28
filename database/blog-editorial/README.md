# Nothing Pakistan editorial rebuild

This directory contains the source and validation record for the 55-article
editorial rebuild. Articles are handled in `displayOrder` from the existing
asset inventory in `tmp/blog-image-sync-report.json`.

## Current status

- Total mapped hero assets: 55
- Published and verified: 55
- Queue complete: all 55 mapped hero assets have been published and verified.
- Supabase started empty for this rebuild; article IDs are assigned on publish.

## Per-article requirements

Every article must:

- contain 3,000-3,600 useful words, while avoiding repetition added only to
  reach a length target;
- use a unique title, excerpt, focus keyword, meta title and 120-160 character
  meta description;
- include a direct answer, at least 12 descriptive H2-H4 headings, at least
  eight original FAQs, and descriptive internal-link anchors;
- link to at least two product records that exist in the current Supabase
  catalog;
- use the mapped 800x600 WebP hero asset with accurate alt text and a caption
  that distinguishes editorial artwork from official product photography;
- distinguish confirmed facts from estimates, rumours and regional
  differences;
- avoid invented Pakistan prices, stock, reviews, warranty, PTA tax, launch
  dates or operator coverage;
- cite primary sources for product specifications and regulated or
  time-sensitive claims;
- pass the dry-run publisher before Supabase is changed;
- pass the production build, database verification and desktop/mobile rendered
  page checks after publication.

## Google Search guidance checked 2026-07-27

Google does not prescribe an ideal word count. The requested approximately
3,000-word length is therefore an editorial scope requirement, not a ranking
claim. Each article is written for the searcher's task first and is allowed to
be longer only when the extra material helps the reader.

Primary guidance:

- Helpful, reliable, people-first content:
  https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- SEO Starter Guide:
  https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Search requirements for developers:
  https://developers.google.com/search/docs/fundamentals/get-started-developers
- Google Images guidance:
  https://developers.google.com/search/docs/appearance/google-images
- Internal links and sitelinks:
  https://developers.google.com/search/docs/appearance/sitelinks

Query wording is researched for each article using current Google results and
official sources. Search volume is not claimed unless it comes from an
accessible, dated first-party dataset. Search Console access timed out during
the initial pass, so no Search Console demand or ranking claim is used.

## Publishing

Dry run:

```bash
npm run blog:publish:editorial -- \
  --article=database/blog-editorial/articles/<article-directory>
```

Publish after a successful dry run:

```bash
npm run blog:publish:editorial -- \
  --article=database/blog-editorial/articles/<article-directory> \
  --apply
```

The publisher checks article length, heading count, metadata, product link
existence, anchor quality and hero-image availability. On apply it upserts the
blog and hero image, replaces that blog's FAQ rows, assigns the featured image
and writes a local `publish-report.json`.
