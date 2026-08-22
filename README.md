# Sharav — Website

Marketing site for Sharav, a Mizrahi Jewish food business selling at farmers markets in the
Washington DC / Maryland area. Built with [Astro](https://astro.build/) on **Wix Managed
Headless**, hosted on Wix infrastructure at `eatsharav.com`.

## How it fits together

- **Code**: this repo (`Ethanb00/sharav`) — an Astro project, source-controlled here as usual.
- **Backend**: Wix Stores (product catalog + cart), Wix Forms (pre-order, catering-quote, and
  newsletter submissions), and a small Wix Data collection (Market Schedule) — all managed from
  the [Wix dashboard](https://manage.wix.com/), no custom admin panel or OAuth proxy needed.
- **Hosting**: published to Wix via the Wix CLI (`wix release`), not GitHub Pages.

## Structure

Standard Wix-managed Astro layout — see `wix.config.json`, `astro.config.mjs`, and `src/pages/`
for the actual routes. Product, form, and schedule content live in Wix (Stores / Forms / Data),
not in this repo — the frontend queries them live at request time.

## Editing content

- **Products, prices, photos**: Wix dashboard → Store → Products.
- **Market Schedule** (day / market / time): Wix dashboard → Content Manager → Market Schedule.
- **Form submissions** (pre-orders, catering requests, newsletter signups): Wix dashboard →
  Contacts / Forms.
- **Page copy, layout, design**: edit the Astro source in this repo and redeploy.

## Running locally

```bash
npm install --ignore-scripts   # --ignore-scripts skips sharp's native build (unused here)
wix dev                        # local dev server
```

## Deploying

```bash
wix build
wix release
```

Publishes straight to the live Wix site — see the Wix dashboard for the deployed URL and status.

## Migration note

This project replaced an earlier Eleventy + Decap CMS + GitHub Pages setup (removed from this
repo's history going forward, still recoverable via `git log` on `main` before this change). That
stack's dedicated Cloudflare Worker (`sharav-cms-auth`) is no longer used by this site and can be
deleted from the Cloudflare dashboard if you want to fully decommission it.
