# Next.js Supabase Project - Development Guidelines

This is a full-stack web application built with:
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase (Authentication & Database)
- **API**: Next.js API Routes

## Project Structure

- `app/` - Next.js App Router (pages and layouts)
- `components/` - Reusable React components
- `lib/` - Utility functions (Supabase clients)
- `public/` - Static assets

## Getting Started

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials
3. Run `npm install`
4. Run `npm run dev`
5. Visit http://localhost:3000

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow Next.js conventions
- Use functional components with hooks
- Directory names in lowercase, component names in PascalCase

### Database
- All database operations go through `/lib/supabase.ts` (client) or `/lib/supabase-server.ts` (server)
- Use Row Level Security (RLS) for data protection
- Tables should have user_id for multi-tenant support

### API Routes
- Validate all inputs
- Check authentication before mutations
- Return appropriate HTTP status codes
- Place routes in `/app/api/[feature]/route.ts`

### Styling
- Use Tailwind utility classes
- Custom colors defined in `tailwind.config.ts`
- Keep component styles in `globals.css` minimal

## Building & Deployment

- `npm run build` - Build for production
- `npm start` - Start production server
- Deploy to Vercel, Netlify, or other Node.js hosting

## Key Files

- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind theme
- `next.config.js` - Next.js configuration
- `.env.local.example` - Environment variable template
