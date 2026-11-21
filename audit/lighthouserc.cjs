const base = require("../lighthouserc.cjs");

// Monthly observation only: collect evidence but do not gate production on lab scores.
module.exports = {
  ci: {
    collect: {
      ...base.ci.collect,
      numberOfRuns: 1,
      url: [
        "http://127.0.0.1:4323/",
        "http://127.0.0.1:4323/en/",
        "http://127.0.0.1:4323/thinking/",
        "http://127.0.0.1:4323/contact/",
        "http://127.0.0.1:4323/en/contact/",
        "http://127.0.0.1:4323/unchair/",
        "http://127.0.0.1:4323/en/unchair/",
      ],
      startServerCommand: "bunx astro preview --host 127.0.0.1 --port 4323",
    },
    assert: { assertions: {} },
    upload: {
      target: "filesystem",
      outputDir: "audit-results/lighthouse",
    },
  },
};
