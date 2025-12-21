import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkReadingTime } from "./remark-reading-time.mjs";
import { remarkModifiedTime } from "./remark-modified-time.mjs";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import jopSoftwarecookieconsent from "@jop-software/astro-cookieconsent";
import remarkMermaid from "remark-mermaidjs";

import react from "@astrojs/react";

// Site URL - should match src/config/site.ts
// Using hardcoded value here since .mjs cannot import .ts directly
const SITE_URL = "https://etienne.deneuve.xyz";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: "",
  redirects: {
    "/blog": "/blog/page/1",
  },
  integrations: [sitemap(), partytown({
    // Adds dataLayer.push as a forwarding-event.
    config: {
      forward: ["dataLayer.push"],
    },
  }), jopSoftwarecookieconsent({
    categories: {
      necessary: {
        enabled: true,
        // this category is enabled by default
        readOnly: true, // this category cannot be disabled
      },
      analytics: {},
    },
    guiOptions: {
      consentModal: {
        layout: "bar inline",
        position: "bottom",
        flipButtons: true,
        equalWeightButtons: true,
      },
      preferencesModal: {
        layout: "box",
        // position: 'left right',
        flipButtons: false,
        equalWeightButtons: true,
      },
    },
    language: {
      default: "fr",
      translations: {
        fr: {
          consentModal: {
            title: "J'utilise quelques cookies",
            description:
              "Je vous rassure, pas grand chose... mais je vais vous le dire.",
            acceptAllBtn: "Tout accepter",
            acceptNecessaryBtn: "Tout refuser",
            showPreferencesBtn: "Gérer les préférences individuelles",
          },
          preferencesModal: {
            title: "Gérer les préférences des cookies",
            acceptAllBtn: "Tout accepter",
            acceptNecessaryBtn: "Tout refuser",
            savePreferencesBtn: "Accepter la sélection actuelle",
            closeIconLabel: "Fermer la fenêtre modale",
            sections: [
              {
                title: "Performance et analyse",
                description:
                  "Ces cookies collectent des informations sur votre utilisation de ce site web. Toutes les données sont anonymisées et ne peuvent pas être utilisées pour vous identifier.",
                linkedCategory: "analytics",
              },
            ],
          },
        },
        en: {
          consentModal: {
            title: "I use some cookies",
            description: "But, I'll tell you about it...",
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Reject all",
            showPreferencesBtn: "Manage Individual preferences",
          },
          preferencesModal: {
            title: "Manage cookie preferences",
            acceptAllBtn: "Accept all",
            acceptNecessaryBtn: "Reject all",
            savePreferencesBtn: "Accept current selection",
            closeIconLabel: "Close modal",
            sections: [
              {
                title: "Performance and Analytics",
                description:
                  "These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.",
                linkedCategory: "analytics",
              },
            ],
          },
        },
      },
    },
  }), react()],
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: "one-dark-pro",
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
    // Example: Switch to use prism for syntax highlighting in Markdown
    remarkPlugins: [
      remarkToc,
      remarkReadingTime,
      remarkModifiedTime,
      remarkMermaid,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
        },
      ],
    ],
  },
});