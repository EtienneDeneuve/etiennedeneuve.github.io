# Contributing to etienne.deneuve.xyz

## Prerequisites

- **Node.js** `22` (see `.nvmrc`)
- **pnpm** `10.27.0` (see `packageManager` in `package.json`)
- **Bun** (for publication policy, media kit, and GitHub sync scripts)

```bash
# Install the repo-pinned pnpm via Corepack
corepack enable
corepack prepare pnpm@10.27.0 --activate

# Install dependencies (strict lockfile)
pnpm install --frozen-lockfile
```

## Everyday commands

| Command                         | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `pnpm run dev`                  | Local Astro dev server                           |
| `pnpm run build`                | Publication policy + production build            |
| `pnpm run preview`              | Serve `dist/` locally                            |
| `pnpm run format`               | Format with Prettier                             |
| `pnpm run format:check`         | Fail if formatting drifts                        |
| `pnpm run lint`                 | ESLint (Astro + TS)                              |
| `pnpm run check`                | Astro/TypeScript check (fails on errors)         |
| `pnpm run validate:collections` | Sync/validate content collections                |
| `pnpm run validate-publication` | Publication policy gate                          |
| `pnpm run spellcheck`           | cspell                                           |
| `pnpm run linkcheck`            | Internal links against `dist/` (run after build) |
| `pnpm run verify-seo`           | SEO config (+ HTML checks when `dist/` exists)   |
| `pnpm run test`                 | Unit checks on `dist/` (SEO + no secrets)        |
| `pnpm run test:e2e`             | Playwright smoke tests on preview                |
| `pnpm run lighthouse`           | Lighthouse CI on critical pages                  |
| `pnpm run generate:assets`      | Refresh social stats assets                      |
| `pnpm run generate-media-kit`   | Regenerate media kit HTML/PDF                    |
| `pnpm run sync:github-projects` | Refresh GitHub metadata (never fails the build)  |

## Suggested local quality loop

```bash
pnpm run format:check
pnpm run lint
pnpm run check
pnpm run validate:collections
pnpm run validate-publication
pnpm run spellcheck
pnpm run build
pnpm run linkcheck
pnpm run verify-seo
pnpm run test
pnpm exec playwright install chromium   # once
pnpm run test:e2e
pnpm run lighthouse
```

Or use the composites:

```bash
pnpm run ci:quality   # pre-build gates
pnpm run ci:build     # build + post-build gates
```

## CI workflows

| Workflow                       | Trigger                          | What it does                                                                                                                                          |
| ------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/pr.yml`     | Pull requests to `master`/`main` | Strict install, format, lint, Astro check, collections, publication policy, spellcheck, SEO, build, internal linkcheck, tests, Playwright, Lighthouse |
| `.github/workflows/deploy.yml` | Push to `master`/`main`          | Same gates, then asset generation, media kit, GitHub metadata sync (fallback-safe), deterministic build, GitHub Pages deploy                          |

Install always uses `pnpm install --frozen-lockfile`.

### Lighthouse critical pages

- `/`
- `/start-here/`
- `/thinking/`
- `/work/`
- `/projects/`
- `/speaking/`
- `/thinking/2024-10-05-automatisation-carousel-linkedin/` (sample article)

### Minimum category budgets

- Performance ≥ 90 (hard fail on all critical pages except `/speaking/`, currently warn-only until font/CSS LCP work)
- Accessibility ≥ 95
- Best practices ≥ 95
- SEO ≥ 95

### Weight budgets (transfer size)

Configured in `lighthouserc.cjs`:

- Initial JavaScript (`script`) ≤ 350 KB
- CSS (`stylesheet`) ≤ 120 KB
- Images ≤ 900 KB
- HTML document ≤ 120 KB

Spellcheck covers UI/config code (FR+EN). Editorial Markdown under `src/content/` is ignored — treat content spelling as an editorial review step.

## Notes

- Do not commit `spell.log` or other generated logs (`*.log` is gitignored).
- `sync:github-projects` writes a stale cache on API errors so deploys stay resilient.
- Site URL is fixed in `astro.config.mjs` (`https://etienne.deneuve.xyz`); CI does not override `--site` / `--base`.
