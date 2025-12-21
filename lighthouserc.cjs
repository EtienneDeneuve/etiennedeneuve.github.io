/** @type {import('@lhci/cli').LighthouseCIConfiguration} */
module.exports = {
  ci: {
    collect: {
      // Number of runs per URL
      numberOfRuns: 3,
      // URLs to test
      url: [
        'http://localhost:4321/',
        'http://localhost:4321/blog',
        'http://localhost:4321/offers',
        'http://localhost:4321/case-studies',
        'http://localhost:4321/resources',
        'http://localhost:4321/speaking',
      ],
      // Start the local server (build must be done first)
      // The preview server serves the built dist folder
      startServerCommand: 'pnpm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 60000,
    },
    assert: {
      // Assertions for all categories
      assertions: {
        // Performance budgets
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Resource sizes (warnings only, not errors)
        'total-byte-weight': ['warn', { maxNumericValue: 2000000 }], // 2MB
        'render-blocking-resources': ['warn', { maxLength: 2 }],
        
        // SEO checks
        'meta-description': 'off', // We handle this manually
        'document-title': 'off', // We handle this manually
        'link-text': 'warn',
        'crawlable-anchors': 'warn',
        
        // Accessibility checks
        'color-contrast': 'error',
        'image-alt': 'error',
        'button-name': 'error',
        'html-has-lang': 'error',
        'aria-hidden-focus': 'error',
      },
    },
    upload: {
      // Upload results to temporary public storage (optional)
      target: 'temporary-public-storage',
    },
  },
};
