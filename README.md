# Sharav — Website

Marketing site for Sharav, a Mizrahi Jewish food business at farmers markets in the Washington
DC / Maryland area. Built with [Eleventy](https://www.11ty.dev/) (plain HTML/CSS/JS output, no
client-side framework), hosted on GitHub Pages at `eatsharav.com`.

## How it fits together

- **Code**: this repo (`Ethanb00/sharav`), built with Eleventy.
- **Homepage design & content**: designed visually at `/editor/` — a
  [GrapesJS](https://grapesjs.com/) canvas that saves straight to `design/homepage.html` /
  `design/homepage.css` in this repo via the GitHub API. Every homepage section (hero, menu,
  schedule, etc.) is edited directly there — duplicate a card, edit text, drag things around. A
  build step (`npm run sync-design`) turns that into `src/index.njk` +
  `src/css/homepage-design.css` on every deploy; those two generated files are never hand-edited.
- **Shared header/footer + Special Order page copy**: `src/_data/site.json` — business name,
  tagline, Instagram, meta tags. Editable through `/admin` (Decap CMS) or directly.
- **Special Order page** (`/special-order/`): a hand-coded pre-order calculator (running total,
  per-size pricing, Web3Forms submission) — not part of the GrapesJS/design pipeline, since it's
  application logic rather than layout.
- **Hosting**: GitHub Pages, deployed automatically by GitHub Actions on every push to `main`
  (`.github/workflows/deploy.yml`), which runs `sync-design` before the Eleventy build.

## Structure

```
design/               homepage.html / homepage.css — the GrapesJS source of truth (edit via /editor/)
scripts/
  sync-design.js       generates src/index.njk + src/css/homepage-design.css from design/ at build time
src/
  editor/              the GrapesJS homepage editor (index.html, config.js, github.js, editor.js)
  admin/               Decap CMS, now scoped to just Site Settings (config.yml, index.html)
  _data/site.json      business name, tagline, Instagram, meta — shared by nav/footer
  _includes/           layouts/base.njk, partials/nav.njk + footer.njk
  index.njk            generated — do not hand-edit, see design/homepage.html instead
  css/style.css        shared shell styles (nav, footer, base typography/reset)
  css/homepage-design.css   generated from design/homepage.css — do not hand-edit
  special-order.njk, js/special-order.js, _data/specialOrder.json   the pre-order page, hand-coded
  images/brand/        official logo, icon, brand-value icons — from the brand guidelines
cms-oauth-worker/      the Cloudflare Worker both /admin and /editor use to log in with GitHub
.github/workflows/     deploy.yml — sync-design, then Eleventy build, then publish to GitHub Pages
```

## Editing the homepage

Go to `https://eatsharav.com/editor/`, log in with GitHub, and edit the canvas directly —
duplicate a dish card for a new item, edit schedule rows, restyle sections. Hit **Save to
GitHub**; that commits `design/homepage.html`/`.css` straight to `main`, which triggers the
Actions build (`sync-design` regenerates the real template, then Eleventy builds it) and the live
site updates within a minute or two.

There's no local install needed for this — it's a hosted page, same as `/admin`.

## Editing shared nav/footer copy or the Special Order catalog

- **Site Settings** (business name, tagline, Instagram, meta tags): `https://eatsharav.com/admin/`,
  or edit `src/_data/site.json` directly.
- **Special Order pricing/copy**: edit `src/_data/specialOrder.json` directly (not in Decap CMS).

## Running locally

```bash
npm install
npm run sync-design   # regenerate src/index.njk + homepage-design.css from design/
npm start              # eleventy --serve, live-reloads at http://localhost:8080
npm run build          # one-off build to _site/
```

## Deploying

Push to `main` — GitHub Actions runs `sync-design` then builds and publishes automatically.
One-time setup already done for this project, listed here for reference:

1. **Settings → Pages → Build and deployment → Source**: set to `GitHub Actions` (not
   "Deploy from a branch").
2. The `CNAME` file at the repo root keeps `eatsharav.com` working through the switch.

## Setting up GitHub login (for /admin and /editor)

Both the CMS and the homepage editor log in with GitHub through the same small proxy — see
[`cms-oauth-worker/README.md`](cms-oauth-worker/README.md) for the one-time setup steps.
