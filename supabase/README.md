## Supabase Setup

This project now reads the live Supabase tables directly and no longer falls back to generated local catalog files.

Ensure `.env.local` contains:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_TABLE`

The storefront currently reads from these live tables:
- `blogs`
- `mobiles`
- `products`
- `categories`
- `category_relations`
- `images`
- `colors`
- `faqs`
- `product_mobiles`
- `orders`

SQL files in this folder:
- `blogs.sql` creates the `public.blogs` table.
- `categories.sql` creates the `public.categories` table and parent index.
- `category-relations.sql` creates the `public.category_relations` table and its indexes.
- `colors.sql` creates the `public.colors` table.
- `faqs.sql` creates the `public.faqs` table.
- `images.sql` creates the `public.images` table, indexes, and slug trigger.
- `mobiles.sql` creates the `public.mobiles` table and slug trigger.
- `orders.sql` creates the `public.orders` table.
- `product-mobiles.sql` creates the `public.product_mobiles` table.
- `products.sql` creates the `public.products` table.
- `reviews.sql` creates the `public.reviews` table.
- `users.sql` creates the `public.users` table.
