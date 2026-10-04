# Comments MVP

A minimal standalone comment page generator for blog posts. Paste an article URL to create a unique discussion URL; comments are published immediately and stored in Postgres.

## Local setup

1. Create a Postgres database (Neon is the simplest option on Vercel).
2. Run `db/schema.sql` against it.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `PAGE_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY`.
4. Run `npm install` and `npm run dev`.

## Deploy to Vercel

Import this directory's Git repository into Vercel, connect a Neon Postgres integration, add `DATABASE_URL`, run the schema once, and deploy.

## MVP behavior

- Discussion URLs encode the normalized original article URL.
- Tracking parameters and URL fragments are removed by the link generator.
- Comments appear immediately; there is no moderation or login.
- Comment bodies render as plain text.
- The homepage shows a public, newest-first comment feed.
- The generator lives at `/admin` and is protected by one private password.
- Discussion pages remain public.
- New comments require successful Cloudflare Turnstile verification.

## Admin media uploader

`/admin/media` uses the existing admin password and session. Select or drag in images, upload them to Cloudinary, then copy `![img](https://...)` Markdown for each upload. The image list lasts for the current page session; the files remain in Cloudinary.

Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`, and `CLOUDINARY_FOLDER_MODE` in `.env.local` and in the deployment environment. Use `dynamic` for asset folders or `fixed` for legacy folder mode. Keep the API secret server-side; never use a `NEXT_PUBLIC_` prefix.

The `/api/admin/media/config` and `/api/admin/media/sign` routes require a valid admin session. Signing accepts only same-origin POST requests and uses the server-configured destination folder. Files upload directly to Cloudinary.
