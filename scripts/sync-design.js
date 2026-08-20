#!/usr/bin/env node
// Regenerates src/index.njk and src/css/homepage-design.css from the GrapesJS
// source-of-truth files in design/. Run automatically in CI before the Eleventy
// build (see .github/workflows/deploy.yml) so a save from /editor/ always takes
// effect on the next deploy — never hand-edit the generated files directly.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const designHtmlPath = path.join(root, "design", "homepage.html");
const designCssPath = path.join(root, "design", "homepage.css");
const outNjkPath = path.join(root, "src", "index.njk");
const outCssPath = path.join(root, "src", "css", "homepage-design.css");

const html = fs.readFileSync(designHtmlPath, "utf8").trim();
const css = fs.readFileSync(designCssPath, "utf8");

const njk = `---
layout: layouts/base.njk
---

${html}
`;

fs.writeFileSync(outNjkPath, njk);
fs.writeFileSync(outCssPath, css);

console.log("Synced design/homepage.html -> src/index.njk");
console.log("Synced design/homepage.css -> src/css/homepage-design.css");
