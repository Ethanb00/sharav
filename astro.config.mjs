// @ts-check
import { defineConfig, envField } from 'astro/config';
import wix from "@wix/astro";
import wixPages from "@wix/astro-pages";

import react from "@astrojs/react";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

// https://astro.build/config
export default defineConfig({
  integrations: [wix(), wixPages(), react()],
  security: { checkOrigin: false },
  adapter: wixHostingAdapter(),

  image: {
    domains: ["static.wixstatic.com"],
  },

  output: "server",

  env: {
    schema: {
      // Square (preorder prepayment) — set with `wix env set --key=<name> --value=<value>`,
      // see README.md "Preorder payments (Square)". Access token/location are optional here
      // (rather than required) so the site still builds/runs before Square is configured;
      // the checkout route itself refuses orders with a clear error until both are set.
      SQUARE_ACCESS_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
      SQUARE_LOCATION_ID: envField.string({ context: "server", access: "secret", optional: true }),
      SQUARE_ENV: envField.string({ context: "server", access: "secret", default: "sandbox" }),
    },
  },
});