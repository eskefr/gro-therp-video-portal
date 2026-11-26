# Peoples Archive — Full UX Specification

> **Purpose:** This document is the product and UX source of truth for the final Peoples Archive site. It is written for the team or agent rebuilding the experience in Django. It covers every page, role, flow, state, rule, and important piece of interface copy. The current Next.js app is the reference implementation.
>
> **Brand:** Peoples Archive, the casting practice of Gro Therp Casting, Copenhagen.
>
> **Last updated:** 2026-11-26  
> **Reference implementation:** https://gro-therp-casting.vercel.app  
> **Demo admin access:** passcode gate, configured by environment. This is demo-only.

---

## 1. How to use this document

1. Treat this document as the intended UX. Where the demo and this document differ, the final build should follow this document unless a newer product decision is recorded in the changelog.
2. Sections marked **Demo-only** are not part of the production UX and should be removed or replaced in the final Django site.
3. Every page has a route, access rule, purpose, primary actions, and empty/error states documented below.
4. Update this file whenever a page, flow, piece of copy, validation rule, status, or admin action changes. Add a changelog entry at the bottom and update **Last updated**.

---

## 2. Product overview

### 2.1 What the site does

Peoples Archive is a casting agency platform with:

- A public, anonymized model archive.
- A public talent application form.
- Private, expiring casting invitations and media requests.
- A private admin workspace for reviewing applications, editing model profiles, managing casts, and inspecting submissions.

### 2.2 Roles

| Role | What they can do |
|---|---|
| Public visitor | Browse the archive, view agency contact details, open the application form. |
| Applicant | Submit a self-application with a headshot and profile information. |
| Invited talent | Use a private invitation link to confirm availability, register, or upload casting media. |
| Casting admin | Sign into the admin workspace, review applications, manage models and casts, generate invites, inspect submissions, edit profiles, and approve/reject applications. |

### 2.3 Primary user journeys

- **Visitor → archive:** `/` → `/archive`; browse initials/age filters; no public model detail page.
- **Applicant → application:** `/apply` → complete profile + headshot → success receipt → admin review.
- **Invited talent → invitation:** private link → phone lookup or media-only request → autosaved form/media → submit → receipt.
- **Admin → review:** `/admin` → pending application or invitation → model profile → inspect history/media → approve or reject.
- **Admin → casting:** cast list → cast detail → add models, write notes, request media, generate links.
- **Admin → invitation tracking:** all links → row opens the model profile with the relevant submission highlighted, or the standalone inspection page if no model is attached.

---

## 3. Global design language

### 3.1 Visual direction

An archival editorial / vintage casting-book aesthetic:

- Warm paper background, manila document panels, ink text, graphite secondary text, ledger-blue rules.
- Sharp corners everywhere; no rounded cards.
- Thin ledger-blue borders and double rules.
- Serif display type for names and headings; sans-serif for UI labels; monospace/typewriter for dates, codes, metadata.
- Restrained motion: hover color shifts, subtle image scale, no decorative animation.
- No gradients except the subtle paper texture. No drop shadows except the existing offset shadow treatment used by some dialogs.

### 3.2 Core tokens

| Token | Value / behavior |
|---|---|
| Paper | `#F6F4EF` — page background |
| Manila | `#EFE2C4` — panels, metadata bands, selected states |
| Ink | `#2C2B29` — primary text |
| Graphite | `#6E6B64` — secondary text |
| Ledger blue | `#3B6E9C` — rules, links, active markers |
| Ledger soft | `#D8E2EB` — soft blue surfaces |
| Destructive | `#9A3B2E` — errors and destructive actions |
| Card paper | `#FBF9F4` |
| Radius | `0` on every element |
| Double rule | 3px double ledger-blue top border |
| Paper texture | paper base plus faint ruled lines and a soft manila radial wash |

### 3.3 Typography

| Use | Font | Notes |
|---|---|---|
| Display / headings / names | Newsreader (serif) | Regular weight, tight tracking |
| UI labels | Inter (sans) | Uppercase micro-labels, 12px minimum, tracking |
| Dates / metadata / codes | Courier Prime (monospace) | Uppercase stamps for references |

Rules:

- Body copy is 14–16px.
- Micro-labels are 12px minimum, uppercase, semibold, tracked.
- Metadata and form hints are 12px minimum.
- Do not use tiny 8–11px text.
- Headings are composed, not oversized; admin headings are intentionally compact.

### 3.4 Global page behavior

- Root `/` redirects to `/archive`.
- The public site is responsive.
- Admin is optimized for desktop but remains usable on mobile.
- Admin and invitation pages are `noindex`.
- Invitation pages are `no-referrer`.
- All dates displayed to users are localized English (UK-style) unless otherwise noted.
- Toast notifications appear bottom-right.

### 3.5 Demo-only global banner

A dark environment banner sits above every page while demo mode is enabled:

- Left: lock icon + `Demo mode`.
- Center links: `Admin View`, `Public Archive`, `Test Invite Link`, and on large screens `Media request`.
- Right on desktop: `Not a live environment`.
- Active link is highlighted with a light marker.
- Hidden entirely when `NEXT_PUBLIC_DEMO_MODE=false` (the final production site should remove this banner).

---

## 4. Route and access map

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Redirects to `/archive`. |
| `/archive` | Public | Public anonymized model archive. |
| `/apply` | Public | Talent application form. |
| `/invite/{token}` | Private bearer link | Expiring cast invitation or media request. |
| `/admin/login` | Public | Admin passcode sign-in. Redirects to `/admin` if already signed in. |
| `/admin` | Admin | Agency overview and review queues. |
| `/admin/archive` | Admin | Approved model archive with search/visibility filters. |
| `/admin/models/{phone digits}` | Admin | Full model profile and history. Phone digits are the admin-facing model identifier; UUIDs remain internal. |
| `/admin/applications` | Admin | Pending application queue. |
| `/admin/jobs` | Admin | Cast/job board. |
| `/admin/jobs/{id}` | Admin | Single cast detail, members, invites, media. |
| `/admin/invitations` | Admin | Invitation tracker. |
| `/admin/invitations/{id}` | Admin | Standalone inspection for invitations with no model attached; model-linked invites redirect to the model profile. |
| Unknown route | Public | 404 page. |

Backend endpoints behind these screens (not user-facing routes):

- Upload ticket / signed upload.
- Invitation phone lookup.
- Invitation draft autosave.
- Invitation submission.

---

## 5. Public site

### 5.1 Public header

Sticky header with a bottom ledger-blue rule:

- Left: Peoples Archive wordmark, links home to `/archive`.
- Right desktop: `Archive`, `Contact`, `Apply`.
- `Contact` is a `mailto:gro@grotherpcasting.dk` link; there is no separate contact page.
- `Apply` is always visible and styled as an outlined button with an arrow.
- At narrower widths, `Archive` and `Contact` hide; `Apply` remains.
- Header background is paper with slight translucency and blur.

### 5.2 Public footer

Three-column layout on desktop, stacked on mobile:

1. **Brand statement**
   - Compact wordmark.
   - Display line: “Distinctive faces, quiet confidence, and work with a point of view.”
   - Paragraph: “Peoples Archive is the casting practice of Gro Therp Casting, working locally and internationally from Copenhagen.”
2. **Explore**
   - Archive
   - Apply
   - Contact (mailto)
   - Admin access
3. **Contact**
   - Address: Blågårdsgade 31C, 2200 København N
   - Casting director: Gro Therp, +45 27 12 70 82, gro@grotherpcasting.dk
   - Casting assistant: Signe Clemmesen, +45 30 30 06 59, signe@grotherpcasting.dk
   - Bottom line: © current year Peoples Archive — Gro Therp Casting / PA / MMXXVI

### 5.3 Archive page — `/archive`

#### Purpose

A public, privacy-first contact sheet of approved models. It intentionally exposes only initials, age, and a portrait.

#### Header

A slim paper-textured band with a double rule and bottom ledger-blue border:

- Only the display heading **“The Archive”**.
- No marketing paragraph, location line, or count in the header. The count appears in the filter bar.

#### Filters

A single filter region above the grid:

- `INDEX` label + search input placeholder **“Search initials”**.
- Initials search is debounced by roughly 450ms.
- Clear-search icon when text is present.
- `Reset index` appears when any filter is active.
- Entry count on the right: `18 entries`, `01 entry`, etc.
- `AGE` label + text-link ranges separated by slashes:
  - `All`
  - `18–25`
  - `26–35`
  - `36–45`
  - `46–55`
  - `56–70`
- Active range is underlined.
- Filters update the URL query and reset pagination to page 1.

#### Grid

- Zero-gap contact sheet.
- 1 column on small screens, 2 at `sm`, 4 at `lg`.
- Wrapper owns top/left hairlines; each cell owns right/bottom hairlines.
- No gaps, shadows, or doubled internal borders.
- Portrait area is 4:5, with a small paper inset frame.
- Portrait treatment: muted color, slightly reduced saturation and contrast; never black-and-white.
- Cards are not clickable publicly. There is no public model detail page.

#### Card caption

Example: `01. AL — 55`

- Catalog index is presentational and continues across pages.
- Initials are generated from the first letters of the first two name words.
- Age is shown after an em dash; missing age shows `—`.
- No full name, city, phone, email, measurements, hair, eyes, bio, or status.

#### Pagination

- 24 models per page.
- Previous / `01 / 02` / Next.
- Hidden if only one page.
- Preserves active filters.

#### Empty states

- With filters: **“No faces match that search.”** / “Try a different age range, search by initials, or clear the filters.” + `Clear filters`.
- No filters: **“The archive is being refreshed.”** / “New faces are added regularly. Please check back soon.”

#### Current limitation to resolve in final build

The database accepts ages 18–90, but the public age filter stops at 56–70. The final site should either extend the ranges to 90 or confirm that older ages are intentionally excluded from public filtering.

### 5.4 Apply page — `/apply`

#### Layout

- Paper texture page.
- Left column: position sticky on desktop.
  - Eyebrow: `Talent applications`.
  - Display heading: “A face is only / the beginning.”
  - Paragraph: “We work with people who bring something of themselves to the frame. If that sounds like you, introduce yourself. No prior agency experience required.”
  - Manila “What happens next” box:
    1. Your application is reviewed by the casting team.
    2. If there’s a fit, we’ll invite you to a short conversation.
    3. Approved profiles join the archive, unless you choose to stay hidden.
  - Email fallback: gro@grotherpcasting.dk.
- Right column: application form card.

#### Form header

- Manila header: `Application` / **“Introduce yourself”** / shield icon + `For agency review`.

#### Required fields

- Full name (minimum 2 characters, maximum 100).
- Age (18–90, required).
- Phone number (required; valid Danish or international; stored in E.164; Danish numbers can omit +45).
- Headshot (required; JPEG/PNG/WebP; max 8 MB).

#### Optional fields

- Email (valid email if supplied).
- City (max 80).
- Height: 130–220 cm.
- Bust: 50–160 cm.
- Waist: 45–160 cm.
- Hips: 50–170 cm.
- Shoe size: 30–52.
- Hair color (max 40).
- Eyes (max 40).
- Bio: max 1,200 characters.
- “Keep my profile hidden from the public archive” checkbox.

#### Form layout

- Ledger-grid form with sections:
  - The basics: name, age, email, city, phone (phone spans full width).
  - Measurements: height, bust, waist, hips in a 2/4-column ledger grid.
  - Colouring & sizing: shoe, hair, eyes.
  - Personal note: bio.
- Inline errors use 12px monospace destructive text.
- Measurements hint: “All measurements in centimetres. Leave blank if unsure.”
- Phone hint: “Danish numbers can be entered as 20 12 34 56.”
- Hidden-profile helper: “The agency can still view and cast you. You can change this later.”
- Consent line: “By applying you agree to the agency storing your details for casting consideration.”
- Submit button: `Send application`, disabled while submitting with `Sending`.
- No autosave on the public application form.

#### Submission result

- Duplicate phone: “A profile with this phone number already exists. Contact the agency if you need help.”
- Missing headshot: “Please upload a headshot before applying.”
- Upload did not finish: “The headshot upload didn’t finish. Please try again.”
- Generic failure: “We couldn’t send your application. Please try again.”

#### Success state

- Replaces the form with a centered receipt.
- Check icon.
- Heading: **“Application received.”**
- Copy: “Thank you for introducing yourself. The agency reviews new applications every week and will be in touch if there’s a fit.”
- Footer line:
  - Hidden: “Your profile will stay private while under review.”
  - Not hidden: “Your profile will appear publicly once approved.”

### 5.5 404 page

- Eyebrow: `404 — Not found`.
- Heading: **“This page has left the set.”**
- Copy: “The link may be mistyped, expired, or no longer part of the archive.”
- Link: “Return to the archive”.

---

## 6. Invitation experience

### 6.1 Invitation shell

Private page at `/invite/{token}`.

Top bar:

- Peoples Archive wordmark.
- Desktop countdown: `Link expires in …`.
- Badge: `Private`.
- Mobile countdown appears in the metadata panel.

Left column:

- Eyebrow: `Casting invitation` or `Casting media request`.
- Reference code: `PA / XXXX`.
- Cast title as display heading.
- Manila metadata panel:
  - Shoot dates.
  - Location or “To be confirmed”.
  - Mobile-only expiry.
- Cast description if present.
- `Client · {name}` if present.
- For media requests: `Requested for {model name}`.
- Help line: “Something not right? Write to gro@grotherpcasting.dk.”

Right column: the flow card.

Footer:

- Copyright.
- “Private invitation · Please do not forward”.

### 6.2 Invitation status model

Effective status is server-authoritative. A link past its expiry is expired even if the stored status is still active or in progress.

| Status | Meaning | Visible label |
|---|---|---|
| `active` | Link generated, no draft yet | `Active` |
| `in_progress` | Draft saved at least once | `In Progress (Draft Saved)` |
| `submitted` | Submitted; waiting for review | General: `Submitted – Awaiting Approval`; targeted media: `Submitted – Media Received` |
| `completed` | Review finished or manually completed | `Completed` |
| `expired` | Past expiry | `Expired` |

### 6.3 General cast invitation flow

Progress: `1 Phone` → `2 Details` → `3 Submit`.

#### Step 1 — Phone lookup

- Icon: phone.
- Eyebrow: `First things first`.
- Heading: **“Let’s find you.”**
- Copy: “Enter the phone number connected to your profile. If you’ve worked with us before, we’ll pull up your details. If not, we’ll ask a few questions.”
- Phone input with placeholder `20 12 34 56`.
- Hint: “Danish numbers can be entered without +45. International numbers should include their country code.”
- Button: `Continue`.
- Loading line: “Checking our archive…”.
- Invalid phone error: “Enter a valid Danish or international number.”
- Lookup security: rate-limited; repeated attempts are blocked temporarily.

Lookup outcomes:

1. **Existing model**
   - Eyebrow: `Profile found`.
   - Heading: “Welcome back, {first name}.”
   - If already on cast: “You’re already part of this cast. You can send fresh casting media below if the team has asked for it.”
   - Otherwise: “We’ll attach your existing profile to this cast. There’s no need to re-enter your details.”
   - Link: “Use a different number”.
   - If media is required, show the media uploader; otherwise show: “No uploads required. Just confirm and we’ll let the casting team know you’re available.”
   - Submit button.
2. **No existing model**
   - Eyebrow: `New to the agency`.
   - Heading: **“Tell us about you.”**
   - Copy: “We couldn’t find a profile with that number. Fill in your details below and the team will review your application alongside this cast.”
   - Link: “Use a different number”.
   - Headshot uploader (required).
   - Full profile form (same fields as public apply).
   - Optional casting media upload if required by the invite.
   - Hidden-profile checkbox.
   - Submit button.
3. **Already submitted / expired**
   - Show the receipt or expired state rather than the form.

#### Step 2/3 — Submission

- Submit is blocked until required fields/headshot/media are present.
- Validation messages:
  - Missing full name: “Please add your full name.”
  - Invalid phone: “Please add a valid phone number.”
  - Missing headshot: “Please upload a headshot before submitting.”
  - Missing required media: “Please upload at least one casting photo or video.”
- On success: show receipt; link becomes terminal.

#### Submission outcome

- Existing model: attach the existing profile to the cast; no duplicate profile is created.
- New model: create a `pending` model using the submitted profile, headshot, and hidden preference; attach it to the cast; store the claiming invitation; the model waits for admin approval.
- Submitted media: attach to the cast membership and the invitation submission record.

### 6.4 Direct media request flow

- Targeted at an existing model who is already attached to the cast.
- Progress: `1 Media` → `2 Submit`.
- Eyebrow: `For {model name}` or `Casting media`.
- Heading: **“Show us where you are now.”**
- Copy: “The team has asked for a short, current casting clip or a few recent photos. Natural light and no heavy retouching, please.”
- Media uploader only; no profile re-entry.
- Autosave note: “Your uploads are saved automatically. You can close this page and come back before the link expires.”
- Submit requires at least one file.
- Submission attaches/replaces media on the cast member and closes the invitation.

If the target model is no longer attached to the cast:

- Heading: “This request is no longer available.”
- Copy: “The model is no longer attached to this cast. Contact the casting team if you think this is a mistake.”

### 6.5 Autosave

Invitation forms autosave continuously while open.

- Debounce: 800ms after changes.
- Draft saves silently and moves an `active` invitation to `in_progress`.
- Saves on page hide with keepalive.
- Draft size limit: 64 KB.
- Only storage paths are persisted for uploads; never signed preview URLs.
- Draft indicator:
  - `Autosave on`
  - `Saving draft…`
  - `Draft saved · HH:mm`
  - Error + `Retry`
- Expired or submitted terminal states stop autosave.
- Draft resumes the form with saved step, phone, profile, headshot, media, lookup, and hidden preference.

### 6.6 Expired state

- Eyebrow: `Invitation closed`.
- Heading: “This invitation link / has expired.”
- Copy: “The form is no longer accepting responses. If you were expecting to submit something, contact the casting team and they can send a fresh link.”
- Link: `Contact casting`.
- Footer link: “Not part of this cast? Apply to the agency.”

### 6.7 Successful submission receipt

Submissions are idempotent by normalized phone plus cast membership. A repeat submission must show the receipt rather than creating duplicate models or cast members.

- Eyebrow: `Submission received` or `Already submitted`.
- For general invites: **“You’re all set / for now.”**
  - Copy: “Your details are attached to {cast}. The agency will review your profile and be in touch if there’s a next step.”
- For media requests: **“Your casting media / is with the team.”**
  - Copy: “The casting team can now review your submission for {cast}. No further action is needed.”
- Footer: “You can close this window.”

### 6.8 Media upload rules

- Up to 6 files per submission.
- Max 50 MB per file.
- Accepted: JPEG, PNG, WebP, MP4, MOV, WebM.
- Headshot: JPEG/PNG/WebP, max 8 MB.
- Uploads go directly to storage via short-lived signed upload URLs.
- Uploader shows file count, max size, thumbnails, video play badges, remove controls, and inline errors.
- Media gallery opens a dark lightbox with:
  - Image or playable video.
  - `1 / N` count.
  - File name.
  - `Open file`.
  - Empty copy: “No casting media submitted yet.”

---

## 7. Admin experience

### 7.1 Authentication

- `/admin/login` uses a single passcode field.
- Heading: **“Admin access”**.
- Passcode label/card: `Access credentials`, `Staff only`.
- Submit: `Enter workspace`; loading: `Checking`.
- Error for wrong passcode; rate-limited after repeated failures.
- Successful login returns to `/admin` or a safe `next` admin path.
- Already authenticated users visiting login are redirected to `/admin`.
- All admin pages are guarded; unauthorized users are redirected to login.
- Footer note: “Demo authentication only. Replace the passcode gate with proper auth before using this with real talent data.” This warning is demo-only and should be removed in production once real auth exists.

### 7.2 Admin layout

Desktop:

- Persistent left sidebar, 224px, manila background.
- Wordmark + `Agency workspace`.
- Navigation: Overview, Archive, Applications, Invitations, Casts.
- Active item: paper background, ink text, 2px ledger inset marker.
- Footer: `Public archive`, `Sign out`.
- Main content max width 1,400px with generous padding.

Mobile:

- Sidebar becomes top block.
- Navigation is a 2-column grid, 3 columns at `sm`.
- `Public archive` and `Sign out` remain at the bottom of the block.
- Page content stacks.

Admin page header:

- Optional back link.
- Optional eyebrow.
- Compact display title.
- Optional short description.
- Optional action on the right.
- No marketing hero on the overview.

### 7.3 Overview — `/admin`

No visible page heading. Starts directly with metrics.

Five metrics in a ledger grid:

1. Approved models
2. Pending applications
3. Hidden profiles
4. Open casts
5. Active links

Values are zero-padded (`19`, `05`, `01`). Last metric spans two columns on mobile, one on desktop. Each card links to its section.

Two queues beneath:

- **Waiting for review** — up to five pending applications with thumbnail, name, city, source, hidden badge; link to queue.
- **Recent invitations** — up to five with recipient/name or “General cast invite”, cast title, status, countdown; recipient links to the model profile or invitation inspection.

Empty copy:

- “The queue is clear.”
- “No invitations generated yet.”

### 7.4 Admin archive — `/admin/archive`

Purpose: approved models only, including hidden profiles.

Header:

- Eyebrow: `Talent archive`.
- Title: `All approved models`.
- Action: `Create model`.

Controls:

- Search by name, city, hair, or eyes.
- Visibility tabs: `All`, `Public`, `Hidden`.
- Result grid: 2/3/4 columns.
- Cards show portrait, full name, city, age, height, phone, hair, `Live` badge, `Hidden` badge where applicable.
- The entire card links to the model profile (`from=archive`).
- Empty state: “No models match that filter.”

Create model dialog:

- Direct entry into the approved archive.
- Requires headshot.
- Full profile form.
- Hidden checkbox.
- Success toast: “Model added to the archive.”

### 7.5 Model profile — `/admin/models/{phone digits}`

The central admin record for a person. Phone digits are the admin-facing identifier; internal UUIDs are not shown. Every admin surface that displays a model — archive cards, dashboard queues, application rows, cast member cards, invitation recipients, and the add-models picker — links here.

#### Header

- Back link based on origin: Archive, Applications, Invitations, or Cast.
- Eyebrow: initials + age (e.g. `AL · 55`).
- Display name.
- Action: `Edit profile`. Editing is available for both pending applications and approved models.

#### Profile column

- Portrait (current headshot or archive placeholder).
- Status badge: `Approved` or `Pending review`.
- `Hidden profile` badge when hidden.

#### Information section

- Phone, email, city, age, height, bust, waist, hips, shoe, hair, eyes.
- Empty values are shown as `—`.
- `About` bio when present.

#### Application section — pending models only

- Eyebrow `Application`.
- Received date.
- Source: `via {cast}` or `direct application`.
- `View submission` anchor when the application came from a cast invite.
- Hidden-request badge.
- Approval controls:
  - Checkbox **“Archive with ‘photo coming soon’”** — checked by default.
  - Helper: “Keeps the archive uniform. The uploaded application photo is kept in media history. Uncheck to use the uploaded photo as the archive portrait.”
  - Primary: `Approve & add to archive`.
  - Secondary/destructive: `Reject`.
- Approve behavior:
  - Model becomes approved.
  - If placeholder is checked, current uploaded application photo is appended to media history and the headshot becomes the standard “Photo coming soon” placeholder.
  - If unchecked, the uploaded photo stays as the archive portrait.
  - Invitations claimed by this model in `submitted` state become `completed`.
  - Admin returns to the application queue with a toast.
- Reject behavior:
  - Confirmation dialog: “Reject this application?” / “{name} will be permanently removed, along with any cast attachments. This cannot be undone.”
  - `Keep application` / `Reject permanently`.
  - Rejection hard-deletes the model and cast memberships, then returns to the queue.

#### Media history

- Shown only when there are retained files.
- Old profile photos are appended here whenever a headshot is replaced.
- Uses the standard media gallery.
- Admin-only; never public.

#### Cast history

- Every cast membership, current and past.
- Shows cast title (links to cast), client, shoot dates, location, cast status, role notes, and media gallery.
- Sorted by shoot date descending.
- Empty: “No cast history yet.”

#### Invitation history

- Every invitation where the model is targeted or has claimed the submission.
- Shows cast title (links to cast), type (`Cast invite` / `Media request`), media requirement, status and dates, media gallery, `Open invite`.
- If the page was opened from the invitation tracker with `?invitation={id}`, the matching entry is highlighted and labeled **“Opened from tracker”**.
- Empty: “No invitations for this model yet.”

#### Edit profile dialog

- Title: “Edit {name}”.
- Copy: “Changes apply to the admin record and the public archive.”
- Photo uploader:
  - Shows the current image.
  - Replacing the image uploads a new headshot (JPEG/PNG/WebP, max 8 MB).
  - Previous photo is appended to media history.
  - No remove action in edit mode.
- All profile fields.
- Hidden checkbox.
- `Save changes` / `Saving`.
- Success toast: “Profile updated.”
- If the phone number changes, the profile URL changes and the browser redirects to the new phone-based URL.
- Phone must remain valid and unique.

#### Back-origin behavior

`from=archive|applications|cast|invitations` controls the header back link:

- Archive → `/admin/archive`
- Applications → `/admin/applications`
- Invitations → `/admin/invitations`
- Cast + cast id → `/admin/jobs/{id}`

### 7.6 Applications — `/admin/applications`

Purpose: pending models awaiting review.

Header:

- Eyebrow: `Applications`.
- Title: `The pending queue`.

Controls:

- Search by name, phone, city, email.
- Pending count.

Table columns:

- Applicant: headshot, name, hidden badge, city.
- Contact: phone, email.
- Stats: height, hair/eyes.
- Source: “Via cast invite” + cast title, or “Direct application”.
- Received: date.
- Chevron affordance on hover.

Interaction:

- Whole row opens `/admin/models/{phone}?from=applications`.
- Name is also a link.
- There is no side sheet; all review and approval happens on the model profile.

Empty states:

- No matches: “No matching applications.”
- No pending applications: “The queue is clear.”
- Description: “New applications and cast-invite registrations will appear here.”

### 7.7 Casts — `/admin/jobs`

Header:

- Eyebrow: `Casts & jobs`.
- Title: `Casting board`.
- Action: `New cast`.

Cast cards:

- Status badge (`Open` / `Closed`).
- Client or `Independent`.
- Cast title.
- Shoot dates and location.
- Model count and media count.
- Entire card links to cast detail.
- Empty: “No casts yet.” / “Create your first cast, add talent from the archive, and send a magic link.”

Create cast dialog:

- Title: `Create a cast`.
- Fields: title (required, 2–140), client (max 120), location (max 120), shoot start, shoot end, brief (max 2,000).
- End date cannot precede start date.
- Success: “Cast created.” and redirect to the new cast detail.

### 7.8 Cast detail — `/admin/jobs/{id}`

Header:

- Back: `All casts`.
- Eyebrow: client or `Independent cast`.
- Title: cast title.
- Description: cast brief.
- Actions: `Add models`, `Generate invite`.
- `Generate invite` is disabled when the cast is closed.

Metadata bar:

- Status badge `Open` / `Closed`.
- `Close cast` / `Reopen cast`.
- Shoot dates.
- Location or `Location TBC`.
- Counts: `N cast · N links`.

#### Attached talent

Member cards:

- Portrait and name link to the model profile with cast context.
- Pending/hidden badges.
- City, height.
- Role notes excerpt or “No role notes yet.”
- Media count.
- Actions: `Notes`, `Request`, remove (trash).
- Media gallery preview.

Notes dialog:

- Title: model name.
- Copy: “Private notes for this cast. Only admins can see them.”
- Role notes max 1,200 characters.
- Save / cancel.
- Success: “Role notes saved.”

Request media:

- Opens the invite dialog targeted at that member.
- Media is always required for direct requests.

Remove member:

- Confirmation: “Remove {name} from this cast?”
- Copy: “Their profile will stay in the archive. Submitted media attached to this cast will be removed.”
- Remove/cancel.

Add models dialog:

- Approved models only.
- Includes hidden profiles, marked.
- Search by name, city, or look (hair/eyes).
- Shows portrait, name, hidden badge, city, height.
- Name/portrait opens the model profile in a new tab.
- `Add` adds the member; success toast.
- `Done` closes.

#### Invitations for this cast

Table columns: Recipient, Type, Expires, Status, Actions.

- Recipient links to model profile with cast/invitation context, or inspection if no model.
- Type: `Media request` or `Cast invite`, with `· media required`.
- Expiry date/time plus countdown.
- Status badge.
- Actions: `Copy` invite link, `Inspect`.
- Empty copy: “No invitations for this cast yet. Generate one when the brief is ready.”

#### Generate invite dialog

General cast invite:

- Title: `Generate a cast invite`.
- Copy: “A single-use link for {cast}. Talent can register or sign in by phone.”
- Expiry picker: `24 hours`, `3 days` (default), `7 days`, `Custom`.
- Custom date-time input.
- Shows “Closes {date/time} · local time”.
- Toggle: “Require casting video/photos during signup” with helper.
- `Generate link`.

Direct media request:

- Title: `Request casting media`.
- Copy: “Send {name} a private upload link for {cast}.”
- Media is always required.
- No media toggle.

After generation:

- “Link ready.”
- Copy: “Copy it and send it directly to the talent. Anyone with this link can submit until it expires.”
- Full link with Copy.
- `Done` / `Open link`.

### 7.9 Invitation tracker — `/admin/invitations`

Header:

- Eyebrow: `Magic links`.
- Title: `Invitation tracker`.
- Action: `Refresh`.

Auto-refresh:

- Every 25 seconds while the tab is visible.
- Manual Refresh button.

Filter tabs with counts:

- All
- Active
- In progress
- Submitted
- Completed
- Expired

Table columns:

- Cast: title + client.
- Recipient: model name or “Any talent”; sublabel `Targeted` or `Open invite`.
- Type: `Media request` / `Cast invite`.
- Requirements: `Media required` / `No media`.
- Expires: date/time + countdown.
- Status badge.
- Actions: `Copy`, and `Complete` only for submitted.

Interaction:

- Whole row opens:
  - Model-linked invite → model profile with `?from=invitations&invitation={id}` and hash `#invitation-{id}`.
  - Invite with no model → standalone inspection page.
- Recipient text also links to the same destination.
- Copy/Complete actions do not trigger row navigation.
- Completing: toast “Invitation marked complete.” and refresh.
- Empty: “No invitations in this view.” / “Generate a cast invite or media request from a cast to see it here.”

### 7.10 Standalone invitation inspection — `/admin/invitations/{id}`

Only used when no model is attached (e.g. an unfinished general invite or draft).

If the invitation has a claimed or targeted model, the route redirects to the model profile with the invitation highlighted. If the invitation was opened from a cast, the redirect preserves the cast return context.

Content:

- Back link to Invitations or Cast.
- Eyebrow: cast title.
- Title: recipient name or `General cast invite`.
- Action: `Open invite`.
- Metadata:
  - Status badge.
  - `Cast invite` / `Media request`.
  - Media required.
  - Expiry.
  - Submitted or draft-saved date.
- Sidebar: headshot if available; private-profile badge.
- Profile fields from the saved draft snapshot.
- About.
- Uploads section with media gallery and draft/submitted source.
- Empty: “Nothing has been submitted for this invitation yet.”

---

## 8. Data model and status semantics

### 8.1 Model

Fields:

- Internal UUID id.
- Full name.
- Generated initials (first letters of first two name words).
- Age (18–90; required for new records).
- Phone (unique, E.164).
- Email, city.
- Height, bust, waist, hips, shoe size.
- Hair color, eyes.
- Bio.
- Current headshot URL.
- Media history: array of previous profile photos retained after replacement or placeholder approval.
- Hidden flag.
- Status: `pending` or `approved`.
- Created/updated timestamps.

Public projection:

- id, initials, age, headshot_url, created_at.
- Approved and not hidden only.
- No public full name, contact, city, measurements, or bio.

Admin-facing URL:

- `/admin/models/{phone digits}`.
- Phone digits are stripped from the normalized E.164 number; internal UUID stays in the database.

### 8.2 Cast

Fields:

- UUID, title, client, description, location.
- Shoot start/end dates.
- Status: `open`, `closed`.
- Created/updated timestamps.

### 8.3 Cast member

Fields:

- UUID, cast id, model id.
- Role notes.
- Submission media array.
- Unique per cast + model.
- Created/updated timestamps.
- Deleting a cast or model cascades the membership.

### 8.4 Invitation

Fields:

- UUID, unique token, cast id.
- `target_model_id` for direct media requests.
- `claimed_model_id` after a general invite is submitted and matched/created.
- `require_media_upload`.
- Expiry.
- Draft data JSON: step, phone, profile, hidden, headshot, media, lookup, timestamps.
- Status: active, in_progress, submitted, completed, expired.
- Submitted timestamp.
- Created/updated timestamps.

Status rules:

- Terminal: submitted, completed, expired.
- Past expiry always becomes expired for open links.
- Submitted and completed show receipts.
- Approval of a claimed model completes its submitted invitations.
- Manual `Complete` on the tracker moves submitted → completed.

### 8.5 Media

- Headshots bucket: public, 8 MB, JPEG/PNG/WebP.
- Casting media bucket: private, 50 MB per file, JPEG/PNG/WebP/MP4/MOV/WebM.
- Uploads use server-issued signed URLs; browser uploads directly.
- Store stable storage paths, not signed URLs.
- Preview URLs for private casting media are generated server-side and expire (approximately one hour in the demo).
- Model `media_history` retains replaced profile photos.

### 8.6 Archive placeholder

- The standard approved-application portrait is a branded “Photo coming soon” placeholder.
- Approval defaults to using this placeholder to keep the archive uniform.
- The uploaded application photo is preserved in media history.
- Admin can later replace the placeholder with a real archive portrait; the placeholder itself is not added to history.

---

## 9. Cross-cutting rules

### 9.1 Validation summary

| Field | Rule |
|---|---|
| Name | 2–100 characters, required |
| Age | integer 18–90, required |
| Email | valid email if provided |
| City | max 80 |
| Height | 130–220 cm |
| Bust | 50–160 cm |
| Waist | 45–160 cm |
| Hips | 50–170 cm |
| Shoe | 30–52 |
| Hair | max 40 |
| Eyes | max 40 |
| Bio | max 1,200 |
| Phone | valid; normalized to E.164; Danish default |
| Cast title | 2–140, required |
| Cast client | max 120 |
| Cast location | max 120 |
| Cast brief | max 2,000 |
| Shoot dates | end must not precede start |
| Role notes | max 1,200 |
| Invite expiry | future, at least 1 minute ahead |
| Draft | max 64 KB serialized |
| Media count | max 6 files |
| Media size | max 50 MB each |
| Headshot size | max 8 MB |

### 9.2 Dates and metadata

- Dates: `7 Dec 2026`.
- Date/time: `28 Nov 2026, 22:05`.
- Short date/time in some list contexts: `28 Nov, 22:05`.
- Countdown: “Expires 3 days”, “Expired”.
- Shoot dates: single date or `start — end`; “Dates to be confirmed” when missing.

### 9.3 Notifications

- Admin success/error notifications use toasts, bottom-right.
- Destructive actions use modal confirmations.
- Copy buttons change to `Copied` briefly.
- Loading buttons disable and show a spinner.

### 9.4 Empty and error states

- Every list and gallery has an explicit empty state.
- Forms show inline field errors and a form-level alert for server errors.
- Admin actions return clear success/error copy.
- A missing route uses the branded 404 page.
- A missing cast/model/invitation returns the 404 page.

### 9.5 Accessibility

- All inputs have visible labels.
- Hero images have descriptive alt text.
- Filter buttons expose pressed state.
- Draft autosave uses an `aria-live` status.
- Form errors use `role="alert"` where appropriate.
- Keyboard focus remains visible with a ledger-blue outline.
- Media thumbnails are buttons with accessible names.
- Do not rely on color alone for status; badges include text and a marker.
- No rounded corners or low-contrast microtext.

### 9.6 Responsive behavior

- Archive: 1 → 2 → 4 columns.
- Admin sidebar: top block + 2/3-column nav on mobile; left sidebar desktop.
- Model profile: single column on mobile; portrait constrained to 260px; two-column desktop.
- Forms: ledger grids collapse to one/two columns.
- Tables scroll horizontally where necessary rather than squeezing columns.
- Invitation page: single column on mobile; sticky information column on desktop.
- Demo banner wraps on mobile.

### 9.7 Privacy and security expectations visible in UX

- Public archive exposes only initials, age, portrait.
- Hidden profiles are excluded from public listings.
- Full model profiles, contact details, applications, casts, and invitation data are admin-only.
- Invitations are bearer capabilities; pages are not indexed and should not be forwarded.
- Expiry is checked on page load, lookup, draft save, upload, and submit.
- Public headshot URLs are accessible by URL even for hidden profiles in the demo; final production should consider a private pending bucket if stricter privacy is required.

---

## 10. Demo-only behavior to remove or replace in production

| Demo behavior | Production expectation |
|---|---|
| Dark demo banner with quick links | Remove. |
| Shared admin passcode | Replace with real staff authentication, roles, and session security. |
| Seeded demo models, casts, invitations, and bundled photos | Remove or replace with real data. |
| Stable demo invitation tokens | Real tokens should be opaque and randomly generated. |
| Copy-link invitation delivery | Add email delivery if required. |
| “Demo authentication only” warning | Remove after real auth is in place. |
| Local mock casting videos/photos | Replace with production media. |
| Placeholder portrait asset | Keep the behavior and visual concept; host in the final static assets. |
| Public headshots in a public bucket | Consider private storage plus signed/public delivery appropriate to the final privacy model. |

The final production UX should preserve all user-facing behavior, statuses, copy, and flows described above unless explicitly changed.

---

## 11. Django build checklist

### Public
- [ ] Root redirect to archive.
- [ ] Public archive with initials/age filters, 24-item pagination, 1/2/4 grid, anonymity rules.
- [ ] Public model cards with index, initials, age, portrait, placeholder support.
- [ ] Public header/footer with exact contact details.
- [ ] Apply form with all fields, headshot upload, hidden preference, success/error states.
- [ ] 404 page.

### Invitations
- [ ] Private tokenized route with noindex/no-referrer.
- [ ] Invitation shell with cast metadata, expiry, private badge, contact fallback.
- [ ] General invite phone lookup.
- [ ] Existing-model branch.
- [ ] New-model registration branch with headshot.
- [ ] Direct media request branch.
- [ ] Media uploader rules and previews.
- [ ] Debounced autosave, resume, draft indicator.
- [ ] Expiry enforcement and expired state.
- [ ] Submission validation and success receipt.
- [ ] Idempotent/terminal handling for already-submitted links.
- [ ] Target-no-longer-on-cast state.

### Admin
- [ ] Passcode/login behavior (or production auth replacement).
- [ ] Guarded admin layout and navigation.
- [ ] Overview stats and review queues.
- [ ] Approved archive search/filter/create.
- [ ] Phone-addressed model profile with back-origin behavior.
- [ ] Profile editing for info, visibility, and photo.
- [ ] Media history and replaced-photo retention.
- [ ] Pending application review with approve/reject.
- [ ] Archive placeholder approval option, default on.
- [ ] Casts list/create.
- [ ] Cast detail, close/reopen, members, notes, media, remove.
- [ ] Add-models picker and model profile links.
- [ ] Invite generation with expiry presets and media toggle.
- [ ] Invitation tracker filters, counts, auto-refresh, row navigation.
- [ ] Copy/complete actions.
- [ ] Standalone invitation inspection.
- [ ] Model-linked invitation redirect and highlighted submission.

### Data and media
- [ ] Models, casts, cast members, invitations, draft data, media history.
- [ ] Status transitions and terminal states.
- [ ] Public/admin field separation.
- [ ] Upload limits and direct-to-storage uploads.
- [ ] Signed private media previews.
- [ ] Placeholder image.
- [ ] Phone normalization and phone-based admin URLs.

### Documentation
- [ ] This document is updated with every UX change.
- [ ] Changelog entry added.
- [ ] Last updated date changed.

---

## 12. Document maintenance

**Rule:** Any change to a page, flow, field, validation rule, status, copy line, component behavior, or admin action must update this document in the same change.

Minimum update process:

1. Update the affected section(s).
2. Update **Last updated** at the top.
3. Add a row to the changelog below.
4. Check the Django build checklist if the change adds or removes a feature.

Repo-level rule: `AGENTS.md` points future agents to this file, and `README.md` links to it.

---

## 13. Changelog

| Date | Area | Change |
|---|---|---|
| 2026-11-26 | All | Initial exhaustive UX specification covering public archive, application flow, invitation flows, admin workspace, model profiles, applications, casts, invitation inspection, media, data model, demo-only behavior, and Django parity checklist. |
