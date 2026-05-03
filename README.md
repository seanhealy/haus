# Haus — Personal Homepage Builder

A small configurable homepage built with Next.js (App Router, TypeScript). This
project provides a simple, self-hosted start page with:

- Full-bleed configurable background image
- Desktop-style quick links with auto-fetched site icons
- Configuration stored in JSON (for now)
- Self-hosted iA Writer Quattro webfonts (optional)

This README documents how to run, configure, and extend the homepage.

---

## Quick start

From the project root (`haus`):

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the homepage.

---

## Where configuration lives

The homepage reads its configuration from `src/config/home.json` at build /
request time on the server, so changes show up on the next request without a
client-side fetch or loading flash. Example fields:

- `background.image` — URL or local `public/` path to the background image
- `background.position` — CSS `background-position`
- `quickLinks` — array of `{ label, url, icon? }`. Icons are auto-fetched from
  [icon.horse](https://icon.horse), which prefers a site's `apple-touch-icon`
  (the high-resolution icon used for "Add to Home Screen") and falls back to the
  favicon. Labels render as text on the background.
  - `icon.scale` (optional) — a number applied as `transform: scale(...)` to the
    icon image inside the squircle tile. Use values >1 to zoom in on icons that
    arrive with built-in padding (e.g. Gmail's small M). The squircle tile stays
    the same size; overflow is clipped by the mask.
  - `icon.backgroundColor` (optional) — CSS color for the squircle tile.
    Defaults to `rgba(255, 255, 255, 0.92)`. Set this when you want the tile to
    match the icon's natural brand color (e.g. `"#FF6B35"` for an orange-branded
    site whose icon has a transparent background).

Example config (already present at `src/config/home.json`):

```src/config/home.json#L1-40
{
	"background": {
		"image": "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80",
		"position": "center center"
	},
	"quickLinks": [
		{
			"label": "Inbox",
			"url": "https://mail.google.com",
			"icon": { "scale": 1.4 }
		},
		{
			"label": "GitHub",
			"url": "https://github.com"
		},
		{
			"label": "Kagi",
			"url": "https://kagi.com",
			"icon": { "backgroundColor": "#FFB319" }
		}
	]
}
```

Edit this file to change the background or quick links.

---

## Fonts

The project is configured to use iA Writer Quattro as a self-hosted font. Font
files are colocated with the layout at `src/app/fonts/` and loaded with
`next/font/local` (paths in `localFont` resolve relative to the calling file).

Files included:

- `src/app/fonts/iawriter-quattro-400.woff2`
- `src/app/fonts/iawriter-quattro-700.woff2`

Upstream:
https://github.com/iaolo/iA-Fonts/tree/master/iA%20Writer%20Quattro/Webfonts

If you want more weights or italics, download them from upstream and drop them
into `src/app/fonts/`, then add the corresponding entries to the `src` array in
`src/app/layout.tsx`.

---

## Code layout (relevant files)

- `src/app/page.tsx` — server entry; imports the config and renders the homepage
- `src/app/components/Homepage.tsx` — main UI (server component)
- `src/app/globals.css` — global styles including the homepage layout and
  background handling
- `src/config/home.json` — configuration for the homepage
- `src/app/fonts/` — self-hosted iA Writer Quattro `.woff2` files

---

## Development notes

- Quick links open in the current tab. Use the browser's URL bar for search;
  there's no in-page search box (rely on the address bar's keyword search / Kagi
  integration / history completion).
- The background supports local files (place images under `public/images/`) or
  remote URLs.
- Quick-link icons are fetched from `icon.horse/icon/{host}`. The service
  prefers `apple-touch-icon` (typically a 180×180 PNG) and falls back to the
  favicon, so most sites render crisply at 64px instead of pixelated. Icons
  with built-in whitespace can be zoomed via `icon.scale`; the squircle tile
  background is configurable per-link via `icon.backgroundColor`.

---

## Next enhancements (ideas)

- Small local admin UI to edit `src/config/home.json` in-browser and persist to
  disk
- Persist configuration to Neon + Drizzle and add a repository abstraction
- Keyboard shortcuts (e.g., `1..9` to open quick links)
- Add optional Google Fonts fallback if local fonts are missing

If you'd like one of those implemented, tell me which and I'll add it.

---

## Available scripts

See `package.json` — typical Next.js scripts are available:

- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run start` — start production server
- `npm run verify` — run tests + lint + typecheck

---

If you want the README to include screenshots or more detailed instructions (for
example a quick guide to editing JSON or adding images), say the word and I’ll
add them.
