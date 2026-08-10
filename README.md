# Comments MVP

A minimal standalone comment page generator for blog posts. Paste an article URL to create a unique discussion URL; comments are published immediately and stored in Postgres.

## Local setup

1. Create a Postgres database (Neon is the simplest option on Vercel).
2. Run `db/schema.sql` against it.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `PAGE_PASSWORD`, and `SESSION_SECRET`.
4. Run `npm install` and `npm run dev`.

## Deploy to Vercel

Import this directory's Git repository into Vercel, connect a Neon Postgres integration, add `DATABASE_URL`, run the schema once, and deploy.

## MVP behavior

- Discussion URLs encode the normalized original article URL.
- Tracking parameters and URL fragments are removed by the link generator.
- Comments appear immediately; there is no moderation or login.
- Comment bodies render as plain text.
- The homepage generator is protected by one private password; discussion pages remain public.
