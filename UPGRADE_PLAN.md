## Astro & SEO Upgrade Plan

**Goal**: Upgrade the site from `astro@4.15.12` to `astro@5.16.6` (and related deps), modernize the code, and improve SEO + AI discoverability (LLM-oriented content like `llm.txt`).

### 1. Preparation ✅
- **Confirm pnpm & Node**  ✅  
  - Ensure Node \>= 20 and latest pnpm installed.  
  - In case `pnpm dlx @astrojs/upgrade` fails, we’ll capture the exact error and fall back to local `npx` or manual upgrade.

- **Create a safety branch**  ⏳ (optional, if not already done)  
  - `git switch -c chore/astro-5-upgrade`

### 2. Dependency Upgrade Strategy ✅
- **Core Astro packages**  ✅  
  - `astro`: upgraded to `5.16.6`.  
  - `@astrojs/check`, `@astrojs/markdown-remark`, `@astrojs/partytown`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/react` → bumped by `@astrojs/upgrade` to latest 5-compatible versions.

- **React & types**  
  - Keep `react`, `react-dom`, `@types/react`, `@types/react-dom` aligned with Astro’s React integration docs.

- **Tooling**  
  - Make sure `typescript`, `eslint`, `eslint-plugin-astro`, `prettier`, `prettier-plugin-astro` are on current stable versions supported by Astro 5.

- **Lockfile refresh**  
  - After changing versions: `pnpm install` to update `pnpm-lock.yaml`.

### 3. Upgrade Execution (CLI + Manual) ✅
- **Astro upgrade CLI**  ✅  
  - `pnpm dlx @astrojs/upgrade` run successfully; core and integrations updated.  
- **Manual version bump**  ✅  
  - `package.json` already updated to `"astro": "^5.16.6"` and `pnpm install` completed.

### 4. Codebase Updates for Astro 5 ⏳
- **Config & entry points**  
  - Review `astro.config.mjs` for deprecated options (adapter configuration, image settings, markdown/MDX/remark config).  
  - Ensure the `content` collection and `src/content/config.ts` still conform to Astro 5’s Content Collections API.

- **Components & layouts**  
  - Check `BaseLayout.astro`, `pages/*.astro`, and key components (`Hero`, `Nav`, `Footer`, `ThemeToggle`, etc.) for any breaking API changes (slots, `Astro.props`, `Astro.site`, `Astro.url`, `Astro.glob`, `Markdown`/`Content` usage, etc.).  
  - Migrate any deprecated patterns per Astro 5 docs.

- **Type-checking & linting**  
  - `pnpm astro check`  
  - `pnpm lint` (or `pnpm eslint .` if configured)  
  - Fix reported issues.

### 5. SEO Enhancements ⏳
- **Metadata & structured data**  
  - Ensure each page has proper `<title>`, meta description, canonical URL, and Open Graph / Twitter tags (likely via `MainHead.astro` or layout).  
  - Add JSON-LD structured data for:  
    - `BlogPosting` on blog posts.  
    - `Person` / `Organization` on the homepage/about.  
    - `BreadcrumbList` for blog/resources navigation.

- **Sitemap & robots**  
  - Confirm `@astrojs/sitemap` is configured correctly and that `robots.txt` is aligned with desired crawl rules.

- **Performance & accessibility**  
  - Ensure images use `astro:assets` or optimized responsive images where possible.  
  - Check heading hierarchy, alt text, and link semantics (for SEO + a11y).

### 6. AI / LLM Optimization ⏳
- **Add `llm.txt`**  ✅  
  - Create `public/llm.txt` describing:  
    - Who you are and what the site is about.  
    - The structure of content (blog, resources, portfolio).  
    - Guidelines for how LLMs should summarize/quote content, and attribution preferences.  
  - Optionally include links to key pages and a short “schema” of the site (sections, tags).

- **Content hints for AI**  ⏳  
  - Add short, consistent “About this page” or “Key takeaways” sections to important pages/posts to give LLMs a concise, high-signal summary.  
  - Ensure RSS feed (`rss.xml.js`) and Open Graph images clearly express the page topic.

- **Static LLM index for GitHub Pages**  ✅  
  - Implemented as a static JSON route at `/llm-index.json` (`src/pages/llm-index.json.ts`):  
    - Lists all blog posts and resources with: type, slug, URL, title, description, tags, dates, and basic image data.  
    - Built at compile time, works on GitHub Pages as a static “fake API” endpoint.  
  - (Optional, future) Add per-page JSON files (e.g. `public/llm/[slug].json`) for your most important content with richer structured fields (sections, FAQs, “best for”, etc.).

### 7. Verification & Deployment ⏳
- **Local verification**  ✅ (dev server runs cleanly on Astro 5.16.6)  
  - `pnpm dev` → click through pages (home, blog index, blog post, resources, 404).  
  - Check console for runtime warnings or hydration issues.

- **Build validation**  
  - `pnpm build`  
  - Fix any build-time type or config errors.

- **SEO checks**  
  - Run Lighthouse (Chrome DevTools) for Performance, SEO, Best Practices, Accessibility.  
  - Iterate on any low-scoring areas.

### 9. Unlighthouse Audits
- **Run Unlighthouse locally**  
  - With the dev server running on `http://localhost:4321` (default Astro):  
    - `npx unlighthouse --site http://localhost:4321 --scanner puppeteer`  
  - Or against the deployed site URL.  
  - Use the HTML report to prioritize fixes (SEO, a11y, performance) and feed the issues back into Cursor prompts.

- **Optional CI integration**  
  - Add an Unlighthouse CI step that runs on main branches and fails if scores drop below thresholds.

### 10. Backlinks & YouTube Integration
- **Backlinks to partner sites**  
  - Add prominent, crawlable links to:  
    - `https://www.omnivya.fr`  
    - `https://www.my-dare.com`  
  - Place them in:  
    - `Footer.astro` (global backlinks).  
    - Possibly in `About` / `Resources` sections with short descriptions.

- **YouTube presence**  
  - Add a “YouTube” link (channel or playlist URL) to the global navigation or footer.  
  - Optionally, at build time:  
    - Fetch latest videos via YouTube Data API (if API key available).  
    - Generate a simple JSON or Astro component that lists latest N videos on a dedicated “Videos” or “Media” page.

### 11. Conventional Commits (Goji) & Content Validation
- **Conventional commits with Goji**  
  - Use [`goji`](https://github.com/muandane/goji) as the primary tool for Conventional Commits + emoji:  
    - Install (one-time, on your machine): follow the instructions in the Goji README (`go install ...` or download a release).  
    - Initialize config in this repo: `goji init --repo` to create `.goji.json`.  
    - Customize types/scopes in `.goji.json` to match your workflow (e.g. `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `ci`).  
    - Typical usage:  
      - `git add .`  
      - `goji draft` (review the message)  
      - `goji draft --commit` (generate + commit).
  - Optionally still add lightweight documentation (e.g. in `CONTRIBUTING.md`) describing the expected format and that Goji is the recommended way to create commits.

- **Blog content validation**  
  - Add a content pipeline step (script or CI job) that:  
    - Parses `src/content/blog/*.md`.  
    - Checks for required frontmatter fields (title, description, date, tags, canonical).  
    - Optionally runs text linting (grammar, spelling, inclusive language).

- **External resource discovery about you**  
  - On-demand (manual step): use a search-based script or LLM-assisted workflow to:  
    - Search for your name and aliases across the web (YouTube, conference talks, blog posts, whitepapers).  
    - Curate a `resources/me.json` (or similar) that is then rendered on a “Media / Publications” page.  
  - Keep this curated (human-reviewed) to avoid low-quality or irrelevant links.

### 8. Prompts to Use in Cursor

#### A. Diagnose `pnpm dlx @astrojs/upgrade` Failure
- **Prompt**:  
  - “I ran `pnpm dlx @astrojs/upgrade@latest` in this repo and it failed with the following output: 
  `Packages: +29
+++++++++++++++++++++++++++++
Progress: resolved 29, reused 26, downloaded 3, added 29, done

 astro  Integration upgrade aborted.

      ▲  error Version latest could not be found!
      ◼  check https://github.com/withastro/astro/releases`. 
Please:  
    1) Explain why it fails.  
    2) Suggest a corrected command.  
    3) If needed, propose a manual upgrade plan for `astro` and official `@astrojs/*` packages using pnpm.”

#### B. Bump All Astro-Related Dependencies
- **Prompt**:  
  - “Given this `package.json` and the goal to use `astro@5.16.6`, update all Astro-related deps (`astro`, `@astrojs/*`, tooling like `@astrojs/check`, `eslint-plugin-astro`, `prettier-plugin-astro`) to suitable versions. Then apply the changes directly to `package.json` and ensure the config in `astro.config.mjs` and `src/content/config.ts` is compatible with Astro 5.”

#### C. Fix Breaking Changes After Upgrade
- **Prompt**:  
  - “I’ve upgraded to `astro@5.16.6` and run `pnpm build`, which reports these errors: `<paste errors>`. Please:  
    1) Identify which Astro 5 breaking changes are involved.  
    2) Propose and apply code fixes in the specific files to make the build pass.  
    3) Keep the existing design/UX intact.”

#### D. Improve SEO on All Main Pages
- **Prompt**:  
  - “Review the Astro pages and layout (`BaseLayout.astro`, `MainHead.astro`, `index.astro`, blog pages, resources pages) and:  
    1) Ensure each page has strong, unique `<title>` and meta descriptions.  
    2) Add or improve Open Graph and Twitter meta tags.  
    3) Add JSON-LD structured data for blog posts and the main site entity.  
    4) Implement any small, safe changes that improve Lighthouse SEO and accessibility scores.”

#### E. Add `llm.txt` and AI-Focused Hints
- **Prompt**:  
  - “Create a `public/llm.txt` file that explains this site to Large Language Models, including:  
    - My bio and areas of expertise.  
    - How the site is structured (blog, resources, portfolio).  
    - How LLMs should summarize or quote content (style, attribution).  
    - Any disclaimers or notes about outdated posts.  
    Then, optionally suggest short ‘Key takeaways’ or ‘Summary’ sections to add to the most important blog posts for better AI consumption.”

#### F. Final QA Before Deploy
- **Prompt**:  
  - “Assuming the build succeeds, review the current codebase for any obvious cleanup or modernization opportunities introduced by Astro 5 (e.g., new APIs, simplifications in layouts/components) and propose a minimal set of refactors that improve maintainability without changing visible behavior.”

#### G. Run Unlighthouse & Act on Findings
- **Prompt**:  
  - “I ran Unlighthouse against my site (`<paste key parts of the Unlighthouse report or link to it>`). Please:  
    1) Summarize the main SEO / performance / a11y issues.  
    2) Propose specific code or config changes in this Astro repo to fix them.  
    3) Prioritize fixes that are low-risk but high-impact.”

#### H. Backlinks & YouTube Integration
- **Prompt**:  
  - “Update the layout/components so that:  
    1) The footer includes crawlable backlinks to `https://www.omnivya.fr` and `https://www.my-dare.com` with short descriptive text.  
    2) My YouTube channel (`<paste URL>`) is linked from the footer or nav.  
    3) Optionally, create a simple ‘Videos’ or ‘Media’ page that lists my latest N YouTube videos using a build-time fetch (if feasible without exposing secrets).”

#### I. Enforce Conventional Commits (Goji)
- **Prompt**:  
  - “Set up Conventional Commits in this repo using [`goji`](https://github.com/muandane/goji) instead of commitlint:  
    1) Assume Goji is already installed on my machine; create a sensible `.goji.json` config for this project (types, scopes, subject max length, etc.).  
    2) Add brief documentation (e.g. in `CONTRIBUTING.md` or `README`) explaining how to use `goji draft` / `goji draft --commit` for all commits.  
    3) (Optional) Propose a lightweight Git hook or workflow that nudges contributors to use Goji without blocking them completely.”

#### J. Validate Blog Content & Curate External Resources
- **Prompt**:  
  - “Create or update scripts/config in this repo so that:  
    1) All `src/content/blog/*.md` files are validated for required frontmatter and basic content rules (non-empty description, min length, etc.).  
    2) Optionally run a text linter (spelling/grammar) on blog content.  
    3) Introduce a curated data file (e.g., `src/content/resources/me.json`) listing external resources about me (talks, other blogs, whitepapers, YouTube videos), and add a page that surfaces these links in a clean layout.”


