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

The most commonly touched pieces of content live in specific, predictable places:

- **Prices & product names**: Wix dashboard → Store → Products. (Photos are *not* pulled from
  here — see below.)
- **Dish photos, descriptions, ordering, "hot"/"signature" tags**: `src/data/menu/*.ts` — one
  file per dish (`hummus.ts`, `zhug.ts`, etc). Each exports an `image` field: either a Wix Media
  asset id (open the photo in the Wix Media Manager → "Copy Media ID" → paste the
  `wix:image://...` string) or a path under `public/images/` (e.g. `/images/dishes/hummus.jpg`).
  Leave `image: ''` to show the "Photo coming soon" placeholder. Changing a product's photo in
  the Wix Store dashboard has no effect on the site — edit the dish's file here instead.
- **Hero photo** (the large image on the homepage banner): the `HERO_IMAGE_ID` constant near
  the top of `src/pages/index.astro` — a standalone Wix Media asset id, independent of any
  dish's photo.
- **Market Schedule** (day / market / time): Wix dashboard → Content Manager → Market Schedule.
- **Form submissions** (pre-orders, catering requests, newsletter signups): Wix dashboard →
  Contacts / Forms. See "Preorder payments" below — the pre-order submission records the order
  for reference, but payment itself is confirmed in Square, not in Wix Forms.
- **Contact info, FAQ copy, story section, footer links**: hardcoded in
  `src/pages/index.astro` — search the file for the text you want to change.
- **Page copy, layout, design**: edit the Astro source in this repo and redeploy.

## Preorder payments (Square)

Pre-orders require payment up front. Submitting the form on `/#order` calls
`src/pages/api/preorder.ts`, which creates a Square [Payment
Link](https://developer.squareup.com/docs/checkout-api) priced from exactly the dishes in the
cart, and the browser is redirected to Square's hosted checkout page to collect payment. The
order is also logged as a Wix Forms submission for visibility in the dashboard, but Square is
the source of truth for whether payment actually cleared — check the Square dashboard before
preparing an order.

This needs two secrets (declared in `astro.config.mjs`'s `env.schema`, read via
`astro:env/server` in `preorder.ts`):

| Variable | Value |
| --- | --- |
| `SQUARE_ACCESS_TOKEN` | An access token (Sandbox or Production) from the [Square Developer Dashboard](https://developer.squareup.com/apps). |
| `SQUARE_LOCATION_ID` | The Square location id the payment link should bill to. |
| `SQUARE_ENV` | `sandbox` (default) or `production` — picks which Square API host to call. |

Set them with the Wix CLI — this writes to the deployed site's environment, not just your
machine:

```bash
npx wix env set --key=SQUARE_ACCESS_TOKEN --value="<token>"
npx wix env set --key=SQUARE_LOCATION_ID --value="<location id>"
npx wix env set --key=SQUARE_ENV --value="production"   # once ready to go live
npx wix env pull                                        # merges values into .env.local for `npm run dev`
```

Until both `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` are set, the pre-order form fails
gracefully with "Online payment is not set up yet" instead of breaking the build.

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
