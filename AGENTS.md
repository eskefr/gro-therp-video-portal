<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Peoples Archive repository guide

Peoples Archive is the public-facing casting archive of Gro Therp Casting. The codebase and deployment names still use `gro-therp`.

## Run and verify

- Local Supabase must be running (`npx supabase start`). Apply schema with `npx supabase db reset --no-seed`, then `npm run db:seed`.
- Demo app: `npm run dev` at `http://localhost:3000`; admin at `/admin`. Local demo passcode is in `.env.local` (`showcase2026`).
- Verification order: `npm run typecheck`, `npm run lint`, then `npm run build`. There is no automated test suite.
- Stop `next dev` before `npm run build`; running both corrupts generated `.next/dev/types` files and makes `tsc` fail.
- `npm run db:seed` refreshes only fixed demo records. `npm run db:seed:reset` wipes all application tables; never point it at production.
- Seed scripts read `.env.local` through `dotenv-cli`. For the hosted database, pass a separate env file explicitly, e.g. `npx dotenv-cli -e .env.hosted -- npx tsx scripts/seed.ts`.

## Architecture

- `UX.md` is the product/UX source of truth for the final Django rebuild. Read it before changing UI. Any page, flow, copy, status, validation, or admin behavior change must update `UX.md`, its Last updated date, and its changelog.
- Next.js 16 App Router, React Server Components by default. Keep `'use client'` limited to filters, forms, uploaders, dialogs, and countdowns.
- DB-backed pages are deliberately `force-dynamic`; Cache Components is disabled. Do not turn it on without restructuring data fetches.
- Next 16 conventions apply: `params`/`searchParams` are Promises, and auth routing lives in `proxy.ts`, not `middleware.ts`.
- `app/(public)` is the public site; `app/invite/[token]` is standalone; `app/admin/(dashboard)` is the guarded workspace. Admin login sits outside the guarded group.
- Admin auth is a demo passcode cookie in `lib/auth`; `proxy.ts` is only an optimistic gate. Layouts and every Server Action call `requireAdmin`/`getAdminSession` themselves.
- Admin model profiles live at `/admin/models/<phone digits>`; the normalized phone is the admin-facing identifier while UUIDs remain the internal database keys. Every model surface links there.
- Applications are reviewed on the model profile, not in a side sheet. Invitation inspection redirects to the model profile when a model is attached, preserving invitation context via `?invitation=`.
- Replaced profile photos append to `models.media_history`; the history is admin-only. Application approval defaults to the standard placeholder at `MODEL_PLACEHOLDER_HEADSHOT`, which is optional via the approval checkbox.
- Theme tokens and global sharp-corner rules live in `app/globals.css`; `app/shadcn.css` is a committed local copy. Fonts are Newsreader (display), Inter (labels/UI), Courier Prime (dates/metadata).
- The archive is a zero-gap contact sheet: the wrapper owns top/left hairlines, each cell owns right/bottom; do not add gaps, shadows, or both sides of internal borders. Its filters are text links, not dropdowns.
- The public archive intentionally exposes only initials, age, and portrait; archive portraits are muted color (not black-and-white). `models.initials` is trigger-derived from the first two name words. Do not add full names, city, or stats back to `PublicModel` or the anon grants; full records stay admin-only. Age is required for new model records.
- `components/ui` is generated shadcn code and imports `cn`/primitives from packages. Custom code uses `@/lib/utils`. Do not reintroduce the `shadcn` CLI dependency or the old `@tailwindcss/turbopack` CSS loader.
- Keep comments intent-only; do not add numbered step comments.

## Supabase and security invariants

- Three clients: `lib/supabase/public.ts` (publishable key + RLS for public archive reads), `admin.ts` (secret key, server-only), `browser.ts` (signed uploads only). Never import the admin client into browser code.
- Public model queries intentionally exclude phone and email. Anon has column-level grants plus RLS; removing fields from `PUBLIC_MODEL_COLUMNS` is intentional. Do not broaden anon access or add PII to public projections.
- Public reads expose only approved, non-hidden models. Invitations, casts, and cast members are server-only.
- `headshots` is public (8 MB); `casting-media` is private (50 MB). Uploads use server-issued signed upload URLs and bytes bypass Vercel. Store stable storage paths, never signed URLs; preview URLs are generated server-side for one hour.
- Invitation expiry is server-authoritative. Use `getEffectiveInvitationStatus` and re-check expiry in page loads, lookup, draft saves, upload tickets, and submission. Terminal states (`submitted`, `completed`) show receipts; active/in-progress past expiry is expired.
- Autosave is a debounced single-flight POST to `/api/invitations/[token]/draft`; it updates `draft_data` and moves `active` to `in_progress`. Do not persist signed URLs in drafts.
- `/invite/[token]/submit` is idempotent by normalized phone plus unique cast membership. It creates invite registrations as `pending`, attaches them to the cast, and preserves hidden preference.
- Demo invitations use stable tokens (`demo-cast-active`, `demo-media-request`, `demo-expired`, etc.). Real tokens use `nanoid(24)`.

## Deployment

- Live URL: `https://gro-therp-casting.vercel.app`.
- Vercel deploys from private GitHub repo `eskefr/gro-therp-casting` on `main`. The git `origin` is the public mirror `eskefr/gro-therp-video-portal`; pushing only to `origin` will not redeploy the live site.
- Push deploys with `git push vercel master:main`. If the `vercel` remote is missing, add `https://github.com/eskefr/gro-therp-casting.git` first. Keep `origin` in sync separately if desired.
- Vercel environment variables are managed in the dashboard. `NEXT_PUBLIC_SITE_URL` must be the bare origin (no `/archive` suffix). Env changes need a redeploy.
- The hosted Supabase schema was applied directly with `psql`, so remote migration history may appear empty; `supabase db push` could try to reapply existing objects. Use migration repair or direct SQL for schema changes.
