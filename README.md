# Next.js Website with Supabase & Tailwind CSS

A full-stack web application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase for live catalog data.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account (free at https://supabase.com)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nothingPakistan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your production site URL and Supabase credentials:
```
NEXT_PUBLIC_SITE_URL=https://www.cmfbynothing.pk
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_TABLE=products
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── Button.tsx        # Button component
│   ├── Card.tsx          # Card component
│   └── Input.tsx         # Input component
├── lib/                  # Utility functions
│   ├── supabase.ts      # Client-side Supabase
│   └── supabase-server.ts # Server-side Supabase
├── public/              # Static assets
├── tsconfig.json        # TypeScript config
├── tailwind.config.ts   # Tailwind config
├── next.config.js       # Next.js config
└── package.json         # Dependencies

```

## 🔧 Key Features

- **Next.js 14** - Latest React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend services and live catalog tables
- **API Routes** - Built-in API endpoints
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Extensible theme system

## 📚 Supabase Setup

### Database Tables

Make sure these tables already exist in your Supabase project.

The storefront reads from these live Supabase tables:
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

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Deploy to Other Platforms

The app can also be deployed to:
- Netlify
- Railway
- Render
- AWS Amplify
- Google Cloud Run

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
## 🔐 Authentication

Authentication routes are ready to use:
- `GET /api/auth` - Check authentication status
- `POST /api/auth` - Sign up user

## 📄 API Routes

- `GET /api/items` - Preview the configured Supabase table
- `POST /api/items` - Insert rows into the configured Supabase table

## 🗃️ SQL Files

- `supabase/blogs.sql` - Creates the `public.blogs` table
- `supabase/categories.sql` - Creates the `public.categories` table and parent index
- `supabase/category-relations.sql` - Creates the `public.category_relations` table and its indexes
- `supabase/colors.sql` - Creates the `public.colors` table
- `supabase/faqs.sql` - Creates the `public.faqs` table
- `supabase/images.sql` - Creates the `public.images` table, indexes, and slug trigger
- `supabase/mobiles.sql` - Creates the `public.mobiles` table and slug trigger
- `supabase/orders.sql` - Creates the `public.orders` table
- `supabase/product-mobiles.sql` - Creates the `public.product_mobiles` table
- `supabase/products.sql` - Creates the `public.products` table
- `supabase/reviews.sql` - Creates the `public.reviews` table
- `supabase/users.sql` - Creates the `public.users` table
- `GET /api/auth` - Check auth status
- `POST /api/auth` - Sign up

## 🎨 Customization

### Colors
Update `tailwind.config.ts` to customize colors:
```typescript
colors: {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
}
```

### Fonts
Fonts are configured in `app/layout.tsx`. Add more fonts from Google Fonts.

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🆘 Support

For issues and questions:
- Check existing documentation
- Review Supabase documentation
- Open an issue on GitHub

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS & Supabase
