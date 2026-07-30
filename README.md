# Sharav — Website

Marketing site for Sharav, a Mizrahi Jewish food business launching at farmers markets in the
Washington DC / Maryland area. Built with [Eleventy](https://www.11ty.dev/) (plain HTML/CSS/JS
output, no client-side framework) and [Decap CMS](https://decapcms.org/) for self-service content
editing, hosted on GitHub Pages at `eatsharav.com`.

## How it fits together

- **Code**: this repo (`Ethanb00/sharav`), built with Eleventy.
- **Content**: `src/_data/*.json` — menu items, the weekly market schedule, and site copy.
  Editable directly, or through the `/admin` content manager (see below).
- **Hosting**: GitHub Pages, deployed automatically by GitHub Actions on every push to `main`
  (`.github/workflows/deploy.yml`).

## Structure

```
src/
  _data/            menu.json, schedule.json, site.json, values.json — all editable content
  _includes/        layouts/base.njk, partials/nav.njk + footer.njk
  index.njk         the one page, composed from the data above
  admin/            Decap CMS (index.html + config.yml)
  css/, js/         styles and the mobile-nav toggle
  images/brand/     official logo, icon, brand-value icons, pattern — from the brand guidelines
  images/dishes/    dish photos land here once they exist (referenced from menu.json)
cms-oauth-worker/   the Cloudflare Worker that lets /admin log in with GitHub (see its README)
.github/workflows/  deploy.yml — builds with Eleventy, publishes to GitHub Pages
```

## Editing content

**Self-service (once OAuth is set up — see `cms-oauth-worker/README.md`):** go to
`https://eatsharav.com/admin/`, log in with GitHub, and edit Menu Items, Market Schedule, or Site
Settings through plain forms. Publishing there commits straight to `main` and the site rebuilds
automatically within a minute or two.

**Directly:** edit the relevant file under `src/_data/` and push. Same rebuild happens either way.

## What's still placeholder

- **Dish/booth photography** — every `menu.json` item has an empty `photo` field, so the site
  shows a subtle branded placeholder card instead of a photo. Add photos via `/admin` (they land
  in `src/images/dishes/`) or drop files in that folder and set the `photo` path manually.
- **Market schedule** — `schedule.json` has two entries with blank `market`/`time` fields, which
  render as "Market & time TBA." Fill them in via `/admin` or directly once markets are confirmed.
- **Email** — `hello@eatsharav.com` is used based on the planned domain; confirm that inbox exists.

There's a visible "site in progress" banner at the top of the page (`.placeholder-banner` in
`base.njk`/`style.css`) — remove it once photography and the schedule are filled in.

Colors, typography, and all logo/icon assets come directly from `Brand guidelines.pdf` and the
official asset pack, not invented.

## Running locally

```bash
npm install
npm start        # eleventy --serve, live-reloads at http://localhost:8080
npm run build    # one-off build to _site/
```

## Deploying

Push to `main` — GitHub Actions builds and publishes automatically. One-time setup required in
the repo (already done for this project, listed here for reference):

1. **Settings → Pages → Build and deployment → Source**: set to `GitHub Actions` (not
   "Deploy from a branch").
2. The `CNAME` file at the repo root keeps `eatsharav.com` working through the switch.

## Setting up the CMS login

The `/admin` content manager needs a small one-time OAuth setup so the site owner can log in with
GitHub — see [`cms-oauth-worker/README.md`](cms-oauth-worker/README.md) for the exact steps.
