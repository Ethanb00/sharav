/**
 * Minimal GitHub OAuth proxy for Decap CMS, running on Cloudflare Workers.
 *
 * GitHub Pages can't run server-side code, so Decap's "Login with GitHub" flow
 * needs somewhere to exchange the OAuth code for an access token without
 * exposing the client secret to the browser. This worker is that somewhere.
 *
 * Routes:
 *   GET /auth      - redirects the popup window to GitHub's authorize page
 *   GET /callback  - GitHub redirects back here with ?code=...; the worker
 *                    exchanges it for a token and hands it to the Decap CMS
 *                    popup via postMessage, matching the handshake Decap's
 *                    github backend expects.
 *
 * Required secrets (set with `wrangler secret put <name>`):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *
 * Required var (in wrangler.toml [vars] or as a secret):
 *   ALLOWED_ORIGIN   e.g. https://eatsharav.com  (the site that's allowed to
 *                    receive the token via postMessage)
 */

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const OAUTH_SCOPE = "repo,user";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      return handleAuth(url, env);
    }
    if (url.pathname === "/callback") {
      return handleCallback(url, env);
    }
    return new Response("Not found", { status: 404 });
  },
};

function handleAuth(url, env) {
  const redirectUri = `${url.origin}/callback`;
  const state = crypto.randomUUID();

  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", OAUTH_SCOPE);
  authorizeUrl.searchParams.set("state", state);

  return Response.redirect(authorizeUrl.toString(), 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing ?code from GitHub", { status: 400 });
  }

  const redirectUri = `${url.origin}/callback`;

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return new Response("Failed to reach GitHub's token endpoint", { status: 502 });
  }

  const tokenData = await tokenResponse.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      `GitHub OAuth error: ${tokenData.error_description || tokenData.error || "unknown error"}`,
      { status: 400 }
    );
  }

  return new Response(renderCallbackHtml(tokenData.access_token, env.ALLOWED_ORIGIN), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// Completes the postMessage handshake Decap CMS's github backend expects
// from a self-hosted OAuth provider popup.
function renderCallbackHtml(token, allowedOrigin) {
  const payload = JSON.stringify({ token, provider: "github" });
  const originLiteral = JSON.stringify(allowedOrigin);

  return `<!DOCTYPE html>
<html>
<body>
<script>
(function () {
  var allowedOrigin = ${originLiteral};

  function receiveMessage(e) {
    if (e.origin !== allowedOrigin) return;
    window.opener.postMessage(
      'authorization:github:success:' + ${JSON.stringify(payload)},
      allowedOrigin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", allowedOrigin);
})();
</script>
<p>Authorized — you can close this window.</p>
</body>
</html>`;
}
