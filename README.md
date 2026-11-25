# PEOPLES ARCHIVE — Casting & Model Agency

A fast, editorial casting-platform prototype built with Next.js App Router, Supabase, Tailwind CSS, shadcn/ui, and Lucide icons. It includes a public model archive, self-registration, expiring magic-link cast invitations with draft autosave, and a demo-friendly admin workspace.

Peoples Archive is the casting practice of Gro Therp Casting in Copenhagen. The interface follows an archival editorial / vintage library-card direction: warm paper and manila surfaces, ledger-blue rules, Newsreader display type, Inter labels, and Courier Prime for dates and metadata.

## What’s included

- **Public archive** with initials and age filters and an initials/age-only public projection.
- **Self-registration** at `/apply`, including an optional hidden profile.
- **Magic-link invitations** at `/invite/[token]`:
  - expiry enforcement
  - debounced autosave and resume
  - phone lookup for existing talent
  - registration for new talent
  - required casting media uploads
  - direct media requests for models already on a cast
- **Admin workspace**:
  - compact overview statistics and review queues
  - approved archive with hidden-profile badges
  - pending application review with approve/reject
  - cast management, role notes, and media previews
  - invite generation with 24h / 3d / 7d / custom expiry
  - invitation tracker with live status, countdowns, and submission inspection
- **Direct-to-Supabase uploads** using short-lived signed upload URLs. File bytes do not pass through Vercel functions.
- **Seed data** for a complete client demo, including every invitation state.

## Stack

- Next.js 16 (App Router, TypeScript)
- React 19
- Tailwind CSS v4 + shadcn/ui + Lucide
- Supabase Postgres, RLS, Storage
- Zod + React Hook Form
- Vercel-ready

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase locally

```bash
npx supabase start
```

This project uses the standard local ports. If the CLI prints different keys, copy them into `.env.local`.

### 3. Environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

ADMIN_PASSCODE=showcase2026
ADMIN_SESSION_SECRET=at-least-32-random-characters-change-this

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_CAST_INVITE_TOKEN=demo-cast-active
NEXT_PUBLIC_DEMO_MEDIA_REQUEST_TOKEN=demo-media-request
NEXT_PUBLIC_DEFAULT_PHONE_COUNTRY=DK
```

`SUPABASE_SECRET_KEY` is server-only. Never expose it through a `NEXT_PUBLIC_` variable.

### 4. Apply the schema

```bash
npx supabase db reset
```

The migration creates the tables, indexes, RLS policies, storage buckets, and bucket limits.

### 5. Seed the demo

```bash
npm run db:seed
```

Use reset mode to wipe all app tables and rebuild the demo:

```bash
npm run db:seed:reset
```

This does not clear storage objects already uploaded during testing. The seeded demo itself uses bundled assets in `public/seed`.

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/` redirects to `/archive`.

## Demo access

Admin passcode is read from `ADMIN_PASSCODE`. The local `.env.local` in this workspace uses `showcase2026`.

Seeded invitation links:

| Link | Purpose |
|---|---|
| `/invite/demo-cast-active` | General invite, casting media required |
| `/invite/demo-cast-no-media` | General invite, no media required |
| `/invite/demo-media-request` | Direct media request for an existing cast member |
| `/invite/demo-draft` | Resume a pre-filled registration draft |
| `/invite/demo-submitted` | Submitted receipt |
| `/invite/demo-completed` | Completed receipt |
| `/invite/demo-expired` | Expired state |

Seed phones use the `+45 20 12 00 XX` range. For example, `20120001` welcomes back Asta Lindberg.

The top demo bar links to Admin, the public archive, and the active test invitation. Set `NEXT_PUBLIC_DEMO_MODE=false` to hide it in a real deployment.

## Deploying Supabase

1. Create a project in the Supabase dashboard.
2. Link and push the migration:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

3. Point `.env.local` at the hosted project and run the seed:

```bash
npm run db:seed
```

4. Ensure the storage buckets exist. The migration creates:
   - `headshots` — public, 8 MB images
   - `casting-media` — private, 50 MB images/video

5. The archive reads through the publishable key and is restricted by RLS to approved, non-hidden profiles. Admin and invitation routes use the server secret key and are never exposed to the browser.

### Phone numbers

Talent phone numbers are matched and stored in E.164 format. Danish numbers can be entered locally (`20 12 34 56`); other numbers should include their country code. Set `NEXT_PUBLIC_DEFAULT_PHONE_COUNTRY` to change the default region.

## Deploying to Vercel

1. Import the repository into Vercel.
2. Add these environment variables for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `ADMIN_PASSCODE`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_DEMO_MODE`
   - `NEXT_PUBLIC_DEMO_CAST_INVITE_TOKEN`
   - `NEXT_PUBLIC_DEMO_MEDIA_REQUEST_TOKEN`
   - `NEXT_PUBLIC_DEFAULT_PHONE_COUNTRY`
3. Use the default Next.js build settings (`npm run build`).
4. Storage CORS is permissive by default on Supabase. If your project restricts origins, allow your Vercel production and preview domains.
5. Uploads are direct browser → Supabase; no special Vercel body-size configuration is needed.

No seed or migration step runs automatically on deploy. Run them manually against the hosted database.

## Project map

```text
app/
  (public)/archive      Public roster and filters
  (public)/apply        Application form
  invite/[token]        Magic-link flow
  admin/                Passcode-gated workspace
  api/                  Upload tickets, lookup, draft save, submission
components/
  public/               Archive, cards, filters, application form
  invite/               Invitation shell and flow states
  admin/                Archive, applications, casts, invites, tracker
  shared/               Uploaders, media gallery, countdown, draft state
lib/
  queries/              Server-side reads
  actions/              Server Actions for admin and applications
  invitations/          Expiry, status, tokens, draft validation
  storage/              Signed previews and upload paths
  validation/           Shared Zod schemas
hooks/                  Autosave, if needed
supabase/
  migrations/           Schema, RLS, buckets
scripts/seed.ts         Deterministic demo data
proxy.ts                Admin route guard
```

## Notes and limitations

- The passcode gate is demo authentication, not a production identity system. Replace it with Supabase Auth or another auth provider before storing real talent data.
- Rejecting an application is a hard delete and removes associated cast memberships. Invitation history keeps a null model reference.
- Invite pages are `noindex`, but a magic link is a bearer capability. Do not forward links.
- Casting links expire server-side. Expiry is evaluated on every page load, lookup, draft save, upload ticket, and submission. No cron is required.
- Uploaded headshots live in a public bucket so they can appear in the public archive. Hidden profiles are excluded from listings, but their image URL is still public-by-URL. Use a private pending bucket if you need stricter image privacy.
- Signed admin media URLs expire after one hour; reload the cast page to refresh them.
- Videos are capped at 50 MB per file. This is intentionally conservative for local and starter Supabase plans.
- The seed uses bundled portrait assets in `public/seed` for speed and offline reliability. Demo portraits were sourced from [grotherpcasting.dk](https://grotherpcasting.dk) and share a muted color grade. Real application and admin uploads use Supabase Storage.
- The public archive exposes only initials, age, and the portrait; full names and profile data stay behind the admin boundary.

## Useful commands

```bash
npm run dev          # local development
npm run build        # production build
npm run start        # production server
npm run lint         # eslint
npm run typecheck    # TypeScript
npm run db:seed      # refresh demo records
npm run db:seed:reset # wipe app tables and reseed
```
