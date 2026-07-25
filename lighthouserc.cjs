/** @type {import('@lhci/cli').LighthouseCiConfig} */
module.exports = {
  ci: {
    collect: {
      // 3 runs + median cuts GHA lab noise (home recently saw 0.68 / 0.83).
      numberOfRuns: 3,
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
      settings: {
        // Consent-gated vendors should not run in lab, but block anyway so a
        // flaky consent path cannot tank CI (see deploy #81 home perf fail).
        blockedUrlPatterns: [
          "*googletagmanager.com*",
          "*google-analytics.com*",
          "*googlesyndication.com*",
          "*clarity.ms*",
          "*c.bing.com*",
        ],
      },
    },
    assert: {
      // Lab CI is noisier than local (esp. home + fonts + cookie banner).
      // Floor 0.80 / median; product target remains ~0.9.
      assertions: {
        "categories:performance": [
          "error",
          { minScore: 0.8, aggregationMethod: "median" },
        ],
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
