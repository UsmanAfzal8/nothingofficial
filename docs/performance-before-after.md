# Performance optimization report

Date: 2026-07-16

## Test method

- Production build (`next build` + `next start`), tested locally on port 3001.
- Lighthouse 13.4.0 mobile profile, performance category only.
- The same representative route was used before and after for each public page template.
- The sitemap contains 164 public URLs and the production build generated 179 routes. Dynamic product, collection, blog, policy, support, and pillar URLs share the templates measured below.
- A final production crawl checked all 163 HTML URLs in the sitemap (the remaining URL is `llms.txt`): all returned successfully and no rendered Cloudinary `<img>` URL was missing `f_auto,q_auto`.
- Optimized Cloudinary derivatives were warmed once before the recorded after test because Cloudinary creates a new width-specific derivative on its first request.
- INP is not produced by a page-load-only Lighthouse run. It requires realistic interactions and is best measured from real users/CrUX. TBT is included as a lab diagnostic, but it is not a replacement for INP.

All times are milliseconds. Transfer is the total page weight in KiB.

## Before and after

| Page template | Performance | FCP | LCP | CLS | TTFB | INP | TBT diagnostic | Transfer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Homepage `/` | 72 → 85 | 1,247 → 1,209 | 10,346 → 4,359 | 0 → 0 | 216 → 24 | N/A → N/A | 113 → 2 | 4,620 → 645 |
| Phone 4b landing | 86 → 85 | 1,217 → 1,222 | 4,217 → 4,222 | 0 → 0 | 34 → 59 | N/A → N/A | 29 → 24 | 941 → 654 |
| Pillar page | 78 → 86 | 1,210 → 1,226 | 5,944 → 4,226 | 0 → 0 | 24 → 93 | N/A → N/A | 30 → 34 | 949 → 651 |
| About page | 85 → 87 | 1,060 → 1,063 | 4,360 → 4,063 | 0 → 0 | 13 → 8 | N/A → N/A | 15 → 12 | 994 → 703 |
| Support centre | 82 → 84 | 1,062 → 1,072 | 4,872 → 4,597 | 0 → 0 | 13 → 32 | N/A → N/A | 29 → 53 | 545 → 536 |
| Collection | 76 → 84 | 1,211 → 1,212 | 7,087 → 4,512 | 0 → 0 | 27 → 63 | N/A → N/A | 18 → 25 | 2,692 → 922 |
| Mobile product | 75 → 80 | 1,366 → 1,370 | 10,975 → 4,895 | 0 → 0 | 84 → 159 | N/A → N/A | 7 → 164 | 2,168 → 776 |
| Audio product | 75 → 81 | 1,210 → 1,221 | 9,090 → 5,054 | 0 → 0 | 54 → 106 | N/A → N/A | 3 → 70 | 1,786 → 673 |
| Blog listing | 81 → 82 | 1,211 → 1,212 | 5,126 → 4,887 | 0 → 0 | 18 → 21 | N/A → N/A | 33 → 4 | 906 → 886 |
| Blog article | 86 → 82 | 1,211 → 1,212 | 4,211 → 4,899 | 0 → 0 | 39 → 24 | N/A → N/A | 35 → 33 | 681 → 685 |
| Contact page | 83 → 87 | 1,062 → 1,063 | 4,825 → 4,138 | 0 → 0 | 11 → 6 | N/A → N/A | 10 → 17 | 1,090 → 1,093 |
| Policy page | 86 → 87 | 1,068 → 1,062 | 4,143 → 4,137 | 0 → 0 | 13 → 7 | N/A → N/A | 1 → 16 | 690 → 693 |
| **Template average** | **80 → 84** | **1,178 → 1,179** | **6,266 → 4,499** | **0 → 0** | **46 → 50** | **N/A → N/A** | **27 → 38** | **1,505 → 743** |

## Main outcomes

- Homepage transfer fell by 86% (4,620 KiB to 645 KiB).
- Homepage LCP improved by 58% (10.35 s to 4.36 s).
- Average transfer across the tested page templates fell by 51%.
- Average LCP improved by 28%.
- CLS stayed at 0 on every measured route.
- FCP and TTFB were already fast and stayed broadly unchanged; small route-to-route differences are normal lab variance.

## Changes made

- Added a global Cloudinary image loader that emits responsive `f_auto,q_auto,w_<width>,c_limit` URLs.
- Applied Cloudinary image normalization to database-backed catalog, product feature, thumbnail, and specification media.
- Added responsive Cloudinary `srcset` values for homepage campaign artwork.
- Added `f_auto,q_auto,vc_auto` delivery for Cloudinary videos while leaving HLS streams unchanged.
- Changed below-the-fold videos from metadata preload to `preload="none"`.
- Gave real above-the-fold/LCP images high fetch priority.
- Deferred Ahrefs analytics until after page load.
- Removed duplicate route-level Inter font downloads that added hundreds of KiB to product, collection, and pillar pages.

## Interpretation

The media bottleneck is substantially reduced. The remaining Lighthouse LCP on several templates is mostly font/text rendering, network simulation, and page structure rather than multi-megabyte original images. Production PageSpeed/CrUX numbers can differ from these local lab numbers because they include hosting latency, CDN cache state, geography, device speed, and real-user behavior.

INP must be collected after deployment from PageSpeed Insights/CrUX or real-user monitoring. A headless page-load audit with no click, tap, or keyboard interaction cannot provide a valid INP value.
