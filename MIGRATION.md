# Supabase to Cloudinary Migration

This project includes a guarded migration script:

```bash
npm run migrate:preflight
npm run migrate:dry-run
npm run migrate:summary:dry-run
npm run migrate:summary:preflight
npm run migrate:replace:safe
```

## Before Replace

1. Review the latest dry-run JSON in `migration-reports/`, or run `npm run migrate:summary:dry-run` for a compact view.
2. Install the sequence-reset helper in destination Supabase.
   - SQL editor option: run `supabase/migration-sequence-reset.sql`.
   - Destination SQL editor URL: `https://supabase.com/dashboard/project/bottkxkrfrqymhygrpun/sql/new`.
   - CLI option after linking the correct destination project or providing a DB URL: run `supabase db push`.
3. Re-run preflight and confirm `preflight.ok` is `true`.
4. Confirm the intentional safe-policy count changes:
   - `images`: source `345`, transformed `314`
   - `faqs`: source `1230`, transformed `950`
   - `category_relations`: source `194`, transformed `128`

Those differences come from:

- `--prune-orphans`: removes dependent rows pointing to missing source product IDs.
- `--drop-skipped-media`: removes external or broken media that is not confirmed as owned/reusable.

All other selected tables are expected to match source counts.

## Sequence Helper Notes

The destination project ref is derived from destination `.env.local` during preflight. If `supabase projects list` does not show that project ref for the active CLI profile, use the Supabase SQL editor or link/login with the account that owns the destination project before running `supabase db push`.

## Replace Verification

After inserts, the script fetches destination rows back and fails the run if:

- destination counts do not match transformed expected counts
- product/category/mobile slugs are not unique
- relations do not resolve
- legacy `cdn.nothingpakistan.pk`, `nothingpakistan.pk`, or Bunny URLs remain
- skipped external/broken media URLs remain
- uploaded Cloudinary URLs fail HTTP validation

## Reports

Generated JSON reports are written to `migration-reports/` and ignored by git. Keep the specific report file paths in hand when approving a replace run.
