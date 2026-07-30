# Sharav CMS auth proxy

A tiny Cloudflare Worker that lets the `/admin` content editor (Decap CMS) log in
with GitHub. GitHub Pages can't run server-side code, so this worker is the one
piece of infrastructure that lives outside GitHub — everything else (code,
content, hosting) stays in the `Ethanb00/sharav` repo and GitHub Pages.

This is a one-time setup. Once it's deployed, logging into `/admin` is just
"click Login with GitHub" — no further maintenance.

## 1. Create a GitHub OAuth App

1. Go to **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
   (direct link: https://github.com/settings/applications/new).
2. Fill in:
   - **Application name**: `Sharav CMS`
   - **Homepage URL**: `https://eatsharav.com`
   - **Authorization callback URL**: `https://sharav-cms-auth.<your-subdomain>.workers.dev/callback`
     (you'll get the exact `<your-subdomain>` value in step 3 below — you can
     come back and edit this field afterward)
3. Click **Register application**.
4. Click **Generate a new client secret** and copy both the **Client ID** and
   the **Client secret** somewhere safe — you'll need them in step 2.

## 2. Deploy the worker

You'll need a free Cloudflare account (cloudflare.com) and Node.js installed.

```bash
cd cms-oauth-worker
npm install -g wrangler   # if you don't already have it
wrangler login             # opens a browser to authorize Wrangler with Cloudflare

wrangler secret put GITHUB_CLIENT_ID
# paste the Client ID from step 1 when prompted

wrangler secret put GITHUB_CLIENT_SECRET
# paste the Client secret from step 1 when prompted

wrangler deploy
```

`wrangler deploy` prints the worker's live URL, something like:

```
https://sharav-cms-auth.<your-subdomain>.workers.dev
```

## 3. Wire the URL up in both places

1. **Back in the GitHub OAuth App** (step 1): edit the **Authorization callback
   URL** to `https://sharav-cms-auth.<your-subdomain>.workers.dev/callback`
   (using your actual worker URL from step 2) and save.
2. **In `src/admin/config.yml`**: replace
   `https://REPLACE-WITH-YOUR-WORKER.workers.dev` under `backend.base_url`
   with your actual worker URL (no trailing `/callback` here — just the
   worker's root URL). Commit and push that change.

## 4. Verify

Visit `https://eatsharav.com/admin/`, click **Login with GitHub**, authorize
the app, and confirm the Decap CMS dashboard loads with the Menu, Market
Schedule, and Site Settings collections. Editing and publishing a change
there commits directly to the `main` branch of the repo, which triggers the
GitHub Actions rebuild and republish automatically.
