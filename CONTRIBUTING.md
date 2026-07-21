# Contributing to etienne.deneuve.xyz

## Prerequisites

- **Bun** (see `packageManager` in `package.json`)
- **Node.js** `22+` still useful for some tooling; CI installs Bun only

```bash
# Install dependencies (strict lockfile)
bun install --frozen-lockfile
```

## Everyday commands

| Command                        | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| `bun run dev`                  | Local Astro dev server                           |
| `bun run build`                | Publication policy + production build            |
| `bun run preview`              | Serve `dist/` locally                            |
| `bun run format`               | Format with Prettier                             |
| `bun run format:check`         | Fail if formatting drifts                        |
| `bun run lint`                 | ESLint (Astro + TS)                              |
| `bun run check`                | Astro/TypeScript check (fails on errors)         |
| `bun run validate:collections` | Sync/validate content collections                |
| `bun run validate-publication` | Publication policy gate                          |
| `bun run spellcheck`           | cspell                                           |
| `bun run linkcheck`            | Internal links against `dist/` (run after build) |
| `bun run verify-seo`           | SEO config (+ HTML checks when `dist/` exists)   |
| `bun run test`                 | Unit checks on `dist/` (SEO + no secrets)        |
| `bun run test:e2e`             | Playwright smoke tests on preview                |
| `bun run lighthouse`           | Lighthouse CI on critical pages                  |
| `bun run generate:assets`      | Refresh social stats assets                      |
| `bun run generate-media-kit`   | Regenerate media kit HTML/PDF                    |
| `bun run sync:github-projects` | Refresh GitHub metadata (never fails the build)  |

## Suggested local quality loop

```bash
bun run format:check
bun run lint
bun run check
bun run validate:collections
bun run validate-publication
bun run spellcheck
bun run build
bun run linkcheck
bun run verify-seo
bun run test
bunx playwright install chromium   # once
bun run test:e2e
bun run lighthouse
```

Or use the composites:

```bash
bun run ci:quality   # pre-build gates
bun run ci:build     # build + post-build gates
```

## CI workflows

| Workflow                       | Trigger                          | What it does                                                                                                                                       |
| ------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/pr.yml`     | Pull requests to `master`/`main` | Bun install, format, lint, Astro check, collections, publication policy, spellcheck, SEO, build, internal linkcheck, tests, Playwright, Lighthouse |
| `.github/workflows/deploy.yml` | Push to `master`/`main`          | Same gates, then asset generation, media kit, GitHub metadata sync (fallback-safe), deterministic build, GitHub Pages deploy                       |

Install always uses `bun install --frozen-lockfile`. Scripts call `bun` / `bunx`.

### Lighthouse critical pages

- `/`
- `/start-here/`
- `/thinking/`
- `/work/`
- `/projects/`
- `/speaking/`
- `/about/`
- `/contact/`

Speaking may warn on performance; other URLs assert harder budgets.

## Content notes

- Thinking articles with a future `pubDate` stay hidden until that date (build-time filter).
- Do not publish unverified client metrics or draft case studies.
- Scalion remains draft until publicly available.
