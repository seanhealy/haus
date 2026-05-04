# Haus — Personal Homepage Builder

A small configurable homepage built with Next.js (App Router, TypeScript), with
configuration stored in Postgres (Neon) via Drizzle. Each homepage lives at
`/<uuid>`; an editor lives at `/<uuid>/edit`.

- Full-bleed configurable background image
- Desktop-style quick links with auto-fetched site icons
- Configuration stored in Postgres as `jsonb`, looked up by uuid
- Self-hosted iA Writer Quattro webfonts (optional)

## Quick start

```bash
npm install
# set DATABASE_URL in .env.local (Neon connection string)
npm run db:push        # apply schema to your database
npm run page:new       # create a homepage row, prints "Created /<uuid>"
npm run dev
```

Visit the printed URL (e.g. `http://localhost:3000/<uuid>`) to view, and
`/<uuid>/edit` to edit.

## Access model

The uuid is the only access control — anyone who knows the URL can both view
**and** edit. Don't share view URLs with people you don't trust to also edit.
For multi-user / public setups, plan to add an `edit_token` column or a real
auth layer before sharing.

## Configuration shape

Stored in `homepages.config` as `jsonb`. Validated with Zod
(`src/app/types.ts`). Shape:

- `title` (optional) — large heading shown at the top; hidden if empty/unset
- `subtitle` (optional) — smaller text below the title; hidden if empty/unset
- `background.image` — http(s) URL or root-relative path for the background
  image
- `sections` — array of `{ label, links }`
  - `label` — section heading (rendered above the links; hidden if empty)
  - `links` — array of `{ label, url, icon? }`
    - `url` must be `http://`, `https://`, or a root-relative path
    - `icon.scale` (optional) — number applied as `transform: scale(...)` to the
      icon image inside the squircle tile. Use values >1 to zoom in on icons
      that arrive with built-in padding
    - `icon.backgroundColor` (optional) — CSS color for the squircle tile

Icons are auto-fetched from [icon.horse](https://icon.horse), which prefers a
site's `apple-touch-icon` and falls back to the favicon.

## Database

- **Driver:** Neon serverless Postgres (`@neondatabase/serverless`)
- **ORM:** Drizzle (`drizzle-orm`, `drizzle-kit`)
- **Schema:** `src/db/schema.ts` — single `homepages` table:
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `config jsonb NOT NULL`
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - `modified_at timestamptz NOT NULL DEFAULT now()` (Drizzle `$onUpdate` hook)

All DB access goes through `src/db/repositories/homepages.ts`. Never import `db`
directly in route handlers or components.

## Code layout

- `src/app/[uuid]/page.tsx` — view route; validates uuid, fetches config, 404s
  otherwise
- `src/app/[uuid]/edit/page.tsx` — edit route (server)
- `src/app/[uuid]/edit/actions.ts` — server action: zod-validates and persists
- `src/app/[uuid]/edit/components/HomepageEditor.tsx` — client form
- `src/app/components/Homepage.tsx` — homepage UI (server component)
- `src/app/components/QuickLinkIcon.tsx` — shared icon-tile component used by
  view and editor
- `src/app/types.ts` — Zod schemas; types are inferred via `z.infer<>`
- `src/app/globals.css` — global styles (homepage + editor)
- `src/db/` — Drizzle schema, client, repositories
- `src/utilities/isUuid.ts` — uuid format guard used before DB lookups
- `scripts/createPage.mjs` — `npm run page:new`

## Fonts

Self-hosted iA Writer Quattro at `src/app/fonts/`, loaded via `next/font/local`
in `src/app/layout.tsx`. Add more weights/italics from
[upstream](https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Quattro/Webfonts)
and register them in the layout.

## Available scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run verify` — tests + lint:fix + typecheck
- `npm run db:generate` — generate migrations from schema
- `npm run db:migrate` — apply pending migrations
- `npm run db:push` — push schema directly (dev shortcut)
- `npm run db:studio` — visual DB browser
- `npm run page:new` — create a new homepage row, prints its URL
