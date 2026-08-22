# Sharav — Website

Marketing site for Sharav, a Mizrahi Jewish food business selling at farmers markets in the
Washington DC / Maryland area. Built with [Astro](https://astro.build/) on **Wix Managed
Headless**.

## How it fits together

- **Code**: this repo (`Ethanb00/sharav`) — an Astro project, source-controlled here as usual.
- **Backend**: Wix Stores (product catalog + cart), Wix Forms (pre-order, catering-quote, and
  newsletter submissions), and a small Wix Data collection (Market Schedule) — all managed from
  the [Wix dashboard](https://manage.wix.com/), no custom admin panel or OAuth proxy needed.
- **Hosting**: published to Wix via the Wix CLI (`npm run release`).

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
npm run dev                    # wix dev — local dev server
```

## Deploying

```bash
npm run build     # wix build
npm run release   # wix release — publishes to the live Wix site
```

## Migration note

This project replaced an earlier Eleventy + Decap CMS + GitHub Pages setup (still recoverable via
`git log` on `main` before this change). That stack's dedicated Cloudflare Worker
(`sharav-cms-auth`) is no longer used and can be deleted from the Cloudflare dashboard.

This Astro project runs on a **newly provisioned** Wix site (Wix-Managed Headless always
provisions a fresh site per project — there's no supported way to attach it to a pre-existing
one). The `eatsharav.com` custom domain and Premium plan need to be moved over from the old Wix
site ("Sharav - Mizrahi Cuisine") to this one via the Wix dashboard.
