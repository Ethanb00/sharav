// Config for the Sharav homepage editor. Points at the same repo and the same
// Cloudflare Worker OAuth proxy Decap CMS already uses (cms-oauth-worker/) —
// no new auth infrastructure needed.
window.SHARAV_EDITOR_CONFIG = {
  owner: "Ethanb00",
  repo: "sharav",
  branch: "main",
  oauthWorkerBase: "https://sharav-cms-auth.sharav.workers.dev",
  htmlPath: "design/homepage.html",
  cssPath: "design/homepage.css",
};
