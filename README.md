# Sharav — Website

Static one-page site for Sharav, a Mizrahi Jewish food business launching at farmers markets
in the Washington DC / Maryland area. Plain HTML/CSS/JS — no build step, so it can be hosted
directly on GitHub Pages.

## Structure

```
index.html
css/style.css
js/main.js
images/favicon.svg
```

## What's placeholder right now

- **Logo** — the nav and footer use a text wordmark ("Sharav" / שרב) instead of the real logo.
  Once the logo is ready (see the Fiverr brief), replace the `.wordmark` markup in `index.html`
  and swap `images/favicon.svg` for the real icon mark.
- **Photography** — every dish/booth image is a dashed placeholder box (`.placeholder-img` in
  `css/style.css`). Replace each `<div class="placeholder-img" ...>` with an `<img>` tag once
  photos exist. There's a visible banner at the top of the page flagging the site as WIP —
  remove the `.placeholder-banner` div in `index.html` once real assets are in.
- **Market schedule** — the "Find Us" section has no real dates/locations yet (none were
  available), so it points people to Instagram instead of showing fake times. Once markets are
  confirmed, either hardcode the schedule in the `.schedule-list` markup or wire it up to
  something dynamic.
- **Email** — `hello@eatsharav.com` is used based on the planned domain from the brand brief;
  confirm that inbox exists before relying on it.

Colors (`css/style.css` `:root`) and copy (menu descriptions, mission statement, target cuisine
description) are pulled directly from the existing brand brief and business plan, not invented.

## Running locally

No build step — just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploying to GitHub Pages

1. Push this folder to the `main` branch of the GitHub repo.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
5. GitHub will publish the site at `https://<username>.github.io/<repo-name>/` within a minute
   or two (a custom domain like `eatsharav.com` can be added later in the same Pages settings
   panel).
