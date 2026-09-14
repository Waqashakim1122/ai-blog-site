# Synthara AI

A lightweight, SEO-optimized Next.js blog covering AI model releases, tools, research, and
industry news. Built with the App Router, TypeScript, Tailwind CSS, and MongoDB.

## Stack

- **Framework:** Next.js 16 (App Router, Server Components by default)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, dark mode via `next-themes`
- **Database:** MongoDB via Mongoose (`Post`, `Author` models)
- **Auth:** NextAuth v5 (Credentials provider, JWT sessions, `admin` / `author` roles)
- **Content:** Markdown, rendered server-side and sanitized (`marked` + `sanitize-html`)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   At minimum you need a `MONGODB_URI` (e.g. a free MongoDB Atlas cluster) and an `AUTH_SECRET`
   (generate one with `npx auth secret`).

3. Seed the database with 3 sample authors and 16 published articles:

   ```bash
   npm run seed
   ```

   This prints the seeded login credentials (email + password) to the console — use them to log
   in at `/admin/login`, then change the password from `/admin/authors`.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` for the public site and `/admin/login` for the admin dashboard.

## Project structure

```
src/
  app/                Routes (public pages, /admin, API routes, sitemap/robots)
  components/          Shared UI components (components/admin for admin-only UI)
  lib/                 DB connection, auth config, SEO/markdown helpers, server actions
  models/              Mongoose schemas (Post, Author)
  scripts/             Seed script and seed content
  types/                Shared plain (serialized) types used across server and client
```

## Content model

- **Post:** title, slug, excerpt, markdown content, cover image + alt text, category, tags,
  author reference, meta title/description, status (draft/published), publishedAt.
- **Author:** name, email, hashed password, bio, avatar, role (`admin` or `author`).
- **Categories:** New Models, Tools, Research, Open Source, Industry News (see
  `src/lib/constants.ts`).

Admins can manage all posts and authors; authors can only create/edit/delete their own posts.

## SEO

- Per-page metadata via the Next.js Metadata API, canonical URLs, Open Graph + Twitter cards.
- `Article` JSON-LD on posts, sitewide `Organization`/`WebSite` JSON-LD, `BreadcrumbList` JSON-LD.
- Auto-generated `/sitemap.xml` and `/robots.txt`; `/ads.txt` is served dynamically from
  `ADSENSE_PUBLISHER_ID` once you have an AdSense account.
- Cover images use locally generated abstract SVG graphics (no external image dependency); admins
  can also paste any external HTTPS image URL.

## Before applying to AdSense / going live

- Set a real custom domain and update `NEXT_PUBLIC_SITE_URL`.
- Set `ADSENSE_PUBLISHER_ID` once approved so `/ads.txt` serves your real publisher line.
- Change the seeded admin/author passwords.
- Review and personalize `/about`, `/privacy-policy`, `/terms-of-service`, and `/disclaimer` for
  your specific business/legal details.
- The seed articles are written as honest, evergreen explainer/analysis journalism grounded in
  well-established AI facts (no fabricated breaking news) — add your own timely posts through
  `/admin/posts/new` as things happen.

## Deploying

Deploy to [Vercel](https://vercel.com/new) and set the environment variables from
`.env.example` in your project settings (`MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_URL`,
`NEXT_PUBLIC_SITE_URL`, and optionally `ADSENSE_PUBLISHER_ID` / `CONTACT_EMAIL_TO`).
