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
for the actual routes. Product catalog data, form submissions, and descriptive schedule rows live
in Wix (Stores / Forms / Data) and are queried live at request time; most page copy — including
this season's specific market dates — is source-controlled in `src/data/content/*.md` instead.
See [Editing content](#editing-content) for where each kind of change belongs.

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
- **Market Schedule**: two separate systems that both render on the "Find Us" section — see
  [Market Schedule](#market-schedule) below.
- **Form submissions** (pre-orders, catering requests, newsletter signups): Wix dashboard →
  Contacts / Forms. See "Preorder payments" below — the pre-order submission records the order
  for reference, but payment itself is confirmed in Square, not in Wix Forms.
- **Most page copy** (headings, intros, eyebrows, FAQ, footer links, the "Our Story" and "Meet
  the Chef" sections): `src/data/content/*.md` — see [Editing copy](#editing-copy-content-collections)
  below. Layout, styling, and anything not sourced from those files (menus, cart logic, the hero
  image id) is still in `src/pages/index.astro`.

### Editing copy (content collections)

Most section copy — eyebrows, headings, intros, button labels — is not hardcoded in
`index.astro`. It's pulled from `src/data/content/*.md` via Astro content collections
(`src/content.config.ts`, the `docs` collection). Each file's name is its id
(`our-story.md` → `getEntry('docs', 'our-story')`); the frontmatter fields are read directly
(`story.heading`), and the markdown body — if the page renders one — becomes the section's
prose. There's no schema, so a field can be added to a `.md` file and referenced in
`index.astro` (or the reverse) freely, but that also means a **typo in a frontmatter key fails
silently** (renders as blank, not an error) — run `npx astro check` after editing a content file
to catch broken YAML before it ships (this has already caught real mistakes, e.g. mismatched
quotes around a pull-quote).

Two files worth knowing about specifically:

- **`src/data/content/our-story.md`** — the Mizrahi history section ("Our Story" / "Why we cook
  this food"). The markdown body is the main prose; `why_label`/`why_text` are the small callout
  box at the end. `story.caption` and `story.byline` are also used by the chef section below.
- **`src/data/content/chef.md`** — the "Meet the Chef" bio. `pull_quote` +
  `quote_attribution` render as the large full-bleed quote break; `epilogue` is the italic
  closing line. `family_caption` labels the family photo (see below).

Both sections float a photo at the top of their body copy so the text wraps around it (the
`<figure class="float-figure float-left|float-right">` markup in `index.astro`, just before
`<StoryContent />` / `<ChefContent />`). The chef section's family photo is optional: it only
renders if `public/images/photo-family.jpg` exists on disk (checked at build time via
`fs.existsSync` in `index.astro`'s frontmatter) — delete the file and the layout collapses back
to a single column automatically, no code change needed.

### Market Schedule

The "Find Us" schedule section is built from **two independent sources** that both render,
stacked:

1. **Specific market dates** (e.g. "every other Sunday through the season") — `market_dates` in
   `src/data/content/find.md`, a plain YAML list of dates (`"September 6, 2026"`, etc.), plus
   `schedule_time` for the shared line above them (`"Sundays, 9AM–1PM"`). This is what to edit
   each season when the calendar changes — it's source-controlled, not in Wix.
2. **Descriptive rows** (venue name, pickup logistics, hours) — the live Wix Data collection
   (dashboard → Content Manager → Market Schedule). This is for the kind of row that doesn't
   change every season, like the pre-order pickup location.

If `market_dates` is empty, `find.schedule_empty` is shown instead as a plain fallback message.

## Preorder payments (Square)

Pre-orders require payment up front. Submitting the form on `/#order` calls
`src/pages/api/preorder.ts`, which creates a Square [Payment
Link](https://developer.squareup.com/docs/checkout-api) priced from exactly the dishes in the
cart, and the browser is redirected to Square's hosted checkout page to collect payment. The
order is also logged as a Wix Forms submission for visibility in the dashboard, but Square is
the source of truth for whether payment actually cleared — check the Square dashboard before
preparing an order.

Every payment link carries a **6% Maryland sales tax**, applied at order scope on the Square
side (`order.taxes[]` with `scope: 'ORDER'`, labelled "MD sales tax (6%)" on the receipt). It is
a single hardcoded rate in `preorder.ts` — changing the rate is a code deploy, not a Square
dashboard tweak.

Each Wix Forms submission's `notes` field ends with a **`Square order: <order_id> · payment
link: <payment_link.id>`** line, captured from the Square response before the redirect. That is
what lets an operator in the Wix dashboard find the matching Square payment without hunting by
timestamp; `(unknown)` in either slot means Square returned an unusual shape and the operator
should reconcile by hand.

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

