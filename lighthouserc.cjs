/** @type {import('@lhci/cli').LighthouseCiConfig} */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 2,
      url: [
        "http://127.0.0.1:4321/",
        "http://127.0.0.1:4321/start-here/",
        "http://127.0.0.1:4321/thinking/",
        "http://127.0.0.1:4321/work/",
        "http://127.0.0.1:4321/projects/",
        "http://127.0.0.1:4321/speaking/",
        "http://127.0.0.1:4321/thinking/2024-10-05-automatisation-carousel-linkedin/",
      ],
      startServerCommand: "bunx astro preview --host 127.0.0.1 --port 4321",
      startServerReadyPattern: "Local",
      startServerReadyTimeout: 120000,
    },
    assert: {
      // Lab CI is noisier than local (esp. home + Google Fonts LCP). Hard floor 0.85;
      // product target remains ~0.9 once fonts are non-blocking.
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 350000 }],
        "resource-summary:stylesheet:size": ["error", { maxNumericValue: 120000 }],
        "resource-summary:image:size": ["error", { maxNumericValue: 900000 }],
        "resource-summary:document:size": ["error", { maxNumericValue: 120000 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
