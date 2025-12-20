# Architecture Map - Etienne Deneuve Personal Site

**Generated:** 2025-01-XX  
**Branch:** `industrialization-baseline`

---

## 1. Short Summary

This is an **Astro-based personal blog/portfolio site** hosted on GitHub Pages. The site features:

- **Content Strategy**: Blog posts (47+ articles) and Resources (2 items) using Astro content collections
- **Content Management**: FrontMatterCMS (VS Code extension) for content authoring and management
- **Tech Stack**: Astro 4.15.12, React, TypeScript, pnpm
- **Deployment**: GitHub Actions workflow deploying to GitHub Pages
- **SEO**: Sitemap, RSS feed, OpenGraph images, basic meta tags
- **Branding**: Mixed references to "Simplifi'ed" (in footer/booking links) and personal brand "Etienne Deneuve"

**Current State:**

- ✅ Basic blog functionality with pagination
- ✅ Resources collection (minimal, 2 items)
- ✅ RSS feed
- ✅ Sitemap integration
- ✅ OpenGraph image generation
- ⚠️ Brand inconsistency (Simplifi'ed vs personal)
- ⚠️ No offers/services page
- ⚠️ No case studies
- ⚠️ No speaking/media kit
- ⚠️ Blog dates show "Mis à jour le" everywhere (using git last modified)
- ⚠️ No automated quality checks (spellcheck, linkcheck, Lighthouse CI)
- ⚠️ Limited SEO completion (missing JSON-LD schemas, canonical URLs)

---

## 2. Routes in src/pages

### Static Routes

- `/` → `src/pages/index.astro` (Homepage with hero, skills, recent blog posts)
- `/404` → `src/pages/404.astro` (404 page)
- `/resources` → `src/pages/resources.astro` (Resources landing page)
- `/resources/all` → `src/pages/resources/all.astro` (All resources listing)

### Dynamic Routes

- `/blog/page/[page]` → `src/pages/blog/page/[page].astro` (Blog pagination, 5 items per page)
- `/[...slug]` → `src/pages/[...slug].astro` (Individual blog post pages)
- `/resources/[...slug]` → `src/pages/resources/[...slug].astro` (Individual resource pages)
- `/resources/__[slug]` → `src/pages/resources/__[slug].astro` (Alternative resource route)

### API/Utility Routes

- `/rss.xml` → `src/pages/rss.xml.js` (RSS feed endpoint)
- `/open-graph/[...ogimage]` → `src/pages/open-graph/[...ogimage].ts` (Dynamic OG image generation)

### Redirects (astro.config.mjs)

- `/blog` → `/blog/page/1`

### Unused/Placeholder Routes

- `src/pages/__about.astro` (commented out in nav)
- `src/pages/__blog/__[...slug].astro` (alternative blog route, unused)
- `src/pages/_blog.astro` (unused)

---

## 3. Layouts and Shared Components

### Layouts

- `src/layouts/BaseLayout.astro` - Main layout wrapper (head, nav, footer, scripts)

### Shared Components (`src/components/`)

- **Navigation**: `Nav.astro` (menu with Home, Blog, Resources links)
- **Footer**: `Footer.astro` (CTA with Simplifi'ed booking link, copyright, socials)
- **Head/Meta**: `MainHead.astro` (OpenGraph, Twitter cards, GA, theme script)
- **UI Components**:
  - `Hero.astro` - Page hero sections
  - `CallToAction.astro` - CTA buttons
  - `ContactCTA.astro` - Contact CTA component (unused in BaseLayout)
  - `Grid.astro` - Grid layout component
  - `Pill.astro` - Tag/badge component
  - `Icon.astro` - Icon component with `IconPaths.ts` definitions
  - `PortfolioPreview.astro` - Blog post preview cards
  - `ResourcesPreview.astro` - Resource preview cards
  - `Skills.astro` - Skills section component
  - `ThemeToggle.astro` - Dark/light mode toggle
  - `DateTime.astro` - Date/time formatting
  - `CustomScripts.astro` - Custom script injection
  - `CustomStyles.astro` - Custom style injection

---

## 4. Content Strategy

### Content Collections (`src/content/config.ts`)

#### Blog Collection (`blog`)

- **Schema**: `title`, `description`, `pubDate`, `lastModified` (optional), `minutesRead` (optional), `tags` (array), `img` (optional), `img_alt` (optional)
- **Location**: `src/content/blog/*.md` (47+ markdown files)
- **Route Pattern**: `/[slug]` via `src/pages/[...slug].astro`
- **Features**: Reading time, modified time via git, tags, images

#### Resources Collection (`resources`)

- **Schema**: `title`, `description`, `category`, `url`, `img` (optional), `tags` (array), `pubDate` (optional)
- **Location**: `src/content/resources/*.md` (2 files: DevSecOps.md, TechSpresso.md)
- **Route Pattern**: `/resources/[...slug]` via `src/pages/resources/[...slug].astro`
- **Status**: Minimal implementation, needs expansion

### Markdown Processing

- **Remark Plugins**: `remark-toc`, `remark-reading-time`, `remark-modified-time`, `remark-mermaid`
- **Rehype Plugins**: `rehype-slug`, `rehype-autolink-headings`
- **Syntax Highlighting**: Shiki with `one-dark-pro` theme

---

## 5. FrontMatterCMS Configuration

**FrontMatterCMS** is a VS Code extension providing a CMS-like interface for content management.

### Configuration (`frontmatter.json`)

- **Framework**: Astro (`frontMatter.framework.id: "astro"`)
- **Preview Host**: `http://localhost:4321`
- **Public Folder**: `public`

### Content Folders

- **Blog**: `src/content/blog` (configured as content type "blog")

### Custom Scripts

1. **Generate Social Image** (`scripts/social-img.mjs`)
   - Generates social media preview images using `node-html-to-image`
   - Updates frontmatter `preview` field with generated image path
   - Uses FrontMatter API (`@frontmatter/extensibility`)
   - Output: `/public/assets/social/{uuid}.png`

2. **Test Script** (`scripts/test.mjs`)
   - Test/example script using FrontMatter API

### Taxonomy & Content Types

- **Blog Content Type** (`frontMatter.taxonomy.contentTypes`):
  - Fields: `title`, `description`, `pubDate`, `lastModified`, `minutesRead`, `tags`, `img`, `img_alt`, `updateDate`, `preview`
  - Preview path: `'blog'`
  - Tags taxonomy managed via `.frontmatter/database/taxonomyDb.json` (39+ tags)

### Database Files (`.frontmatter/database/`)

- `taxonomyDb.json` - Tag taxonomy (39 tags: API, Ansible, Azure, Terraform, etc.)
- `mediaDb.json` - Media library references
- `pinnedItemsDb.json` - Pinned content items

### Dependencies

- `@frontmatter/extensibility`: ^0.0.14 (devDependency) - API for custom scripts

**Note**: FrontMatterCMS is a VS Code extension tool, not a runtime dependency. It provides:
- Visual content editor with form fields
- Taxonomy management (tags)
- Custom script execution (social image generation)
- Content preview in VS Code
- Media library management

---

## 6. Existing Integrations (astro.config.mjs)

- **@astrojs/sitemap** - Sitemap generation
- **@astrojs/partytown** - Third-party script isolation (Google Analytics)
- **@jop-software/astro-cookieconsent** - Cookie consent banner (FR/EN)
- **@astrojs/react** - React support
- **@thewebforge/astro-og-images** - OpenGraph image generation

### Site Configuration

- **Site URL**: `https://etienne.deneuve.xyz`
- **Base**: `""` (root)
- **Redirects**: `/blog` → `/blog/page/1`

---

## 7. Existing CI (.github/workflows/astro.yml)

### Workflow: "Deploy Astro site to Pages"

**Trigger**: Push to `master` branch, manual dispatch

**Jobs:**

1. **build** (ubuntu-latest)
   - Checkout code
   - Setup pnpm 8.4.0
   - Setup Node.js LTS
   - Install Playwright browsers (for OG image generation)
   - Configure GitHub Pages
   - Install dependencies (`pnpm install`)
   - Build Astro site (`npx astro build`)
   - Upload artifact (`dist/`)

2. **deploy** (ubuntu-latest)
   - Deploy to GitHub Pages

**Current Limitations:**

- ❌ No linting/typechecking
- ❌ No spellchecking
- ❌ No link checking
- ❌ No Lighthouse CI
- ❌ No test suite
- ⚠️ Git fetch depth not configured (needed for `remark-modified-time`)
- ✅ Uses pnpm caching implicitly
- ✅ Uses Node LTS

---

## 8. TODO List by Category

### UX/Content

#### TODO 1: Brand Consistency (Simplifi'ed / Omnivya / Personal)

**Files to audit/modify:**

- `src/components/Footer.astro` (line 9: "Simplifi'ed")
- `src/components/ContactCTA.astro` (line 9: booking link with <SimplifiED1@simplified.fr>)
- `src/components/MainHead.astro` (meta tags, site name)
- `src/pages/index.astro` (homepage content)
- `src/layouts/BaseLayout.astro` (default title/description)
- All page files for brand mentions
- Create: `src/config/site.ts` (single source of truth for brand config)

**Action**: Unify brand strategy, create config file, refactor all references

---

#### TODO 2: Create Offers/Services Page

**New files to create:**

- `src/pages/offers.astro` (or `src/pages/services.astro`)
- `src/components/OfferCard.astro` (reusable offer card component)

**Files to modify:**

- `src/components/Nav.astro` (add navigation entry)
- `src/pages/offers.astro` (add JSON-LD Service schema in head)

**Action**: Create 3 packaged offers with CTAs, structured data, responsive layout

---

#### TODO 3: Case Studies Content Collection

**New files to create:**

- `src/content/caseStudies/` directory
- `src/content/config.ts` (add caseStudies collection schema)
- `src/pages/case-studies.astro` (listing page with filters)
- `src/pages/case-studies/[...slug].astro` (detail pages)
- `src/components/MetricPill.astro`
- `src/components/ResultList.astro`

**Files to modify:**

- `src/content/config.ts` (add schema)
- `src/components/Nav.astro` (add navigation entry)
- `frontmatter.json` (add caseStudies content type and page folder for FrontMatterCMS)

**Action**: Create scalable case studies model, seed with 2 draft examples, configure FrontMatterCMS support

---

#### TODO 4: Speaking/Media Kit Page

**New files to create:**

- `src/pages/speaking.astro` (speaking page)
- `src/scripts/generate-media-kit.mjs` (PDF generation script)
- `public/media-kit.pdf` (generated artifact)

**Files to modify:**

- `src/components/Nav.astro` (add navigation entry)
- `.github/workflows/astro.yml` (add artifact upload step)

**Action**: Create speaking page with topics, formats, past appearances, downloadable PDF

---

#### TODO 5: Resources Catalog Enhancement

**Files to modify:**

- `src/content/config.ts` (expand resources schema: `type`, `level`, `topic`, `whyItMatters`, `whenToUse`, `timeToConsume`, `lastReviewed`)
- `src/pages/resources.astro` (group by topic, show level/time/reviewed date)
- `src/pages/resources/all.astro` (add "Recently reviewed" section)
- `src/content/resources/*.md` (migrate existing 2 items to new schema)
- `frontmatter.json` (update resources content type schema to match new fields)

**New files to create:**

- `src/scripts/check-resource-review.mjs` (lint rule for review dates)

**Action**: Transform resources from minimal list to catalog with review dates and grouping, update FrontMatterCMS schema

---

### SEO

#### TODO 6: Blog Date Handling Fix

**Files to modify:**

- `remark-modified-time.mjs` (change logic: only show updated if >7 days from published)
- `src/pages/[...slug].astro` (update date display logic)
- `src/components/DateTime.astro` (if used for blog dates)

**Action**: Fix misleading "Mis à jour le" dates, use git dates only when significantly different

---

#### TODO 7: SEO Completion Pack

**Files to modify:**

- `astro.config.mjs` (ensure sitemap config is complete)
- `src/components/MainHead.astro` (add canonical URLs, ensure OG/Twitter cards site-wide)
- `src/pages/rss.xml.js` (verify RSS feed completeness)
- `public/robots.txt` (update sitemap URL to production)

**New files to create:**

- `src/config/site.ts` (single `siteUrl` config)
- JSON-LD schemas in:
  - `src/pages/index.astro` (Person, Website)
  - `src/pages/offers.astro` (Service)
  - `src/pages/[...slug].astro` (Article)

**Action**: Complete SEO setup with JSON-LD, canonical URLs, site-wide OG tags

---

### CI Automation

#### TODO 8: Spellchecking (FR + EN)

**New files to create:**

- `cspell.json` (cspell configuration)
- `cspell-dict.txt` (custom words: Simplifi'ed, Omnivya, tech terms)

**Files to modify:**

- `package.json` (add `spellcheck` script)
- `.github/workflows/astro.yml` (add spellcheck job)

**Action**: Add automated spellchecking with French/English dictionaries, CI integration

---

#### TODO 9: Link Checking

**New files to create:**

- `.lycheeignore` (allowlist for flaky domains)

**Files to modify:**

- `package.json` (add `linkcheck` script)
- `.github/workflows/astro.yml` (add linkcheck job, scheduled weekly run)

**Action**: Add automated link checking with lychee, CI integration

---

#### TODO 10: Lighthouse CI

**Files to modify:**

- `.github/workflows/astro.yml` (add Lighthouse CI job with thresholds)

**Action**: Add Lighthouse CI for performance/SEO/accessibility budgets, upload reports as artifacts

---

#### TODO 11: Unified CI Pipeline

**Files to modify:**

- `.github/workflows/astro.yml` (merge into single pipeline with stages: install, lint, typecheck, build, spellcheck, linkcheck, lighthouse)

**New files to create (optional):**

- `.github/workflows/ci.yml` (if separating CI from deploy)

**Action**: Create unified quality gate pipeline with clear stages, annotations, caching

---

### Maintenance Automation

#### TODO 12: CTA Fallback (No-JS)

**Files to modify:**

- `src/components/Footer.astro` (add mailto fallback)
- `src/pages/offers.astro` (add mailto + calendar link fallbacks)
- `src/pages/speaking.astro` (add mailto + calendar link fallbacks)
- `src/components/ContactCTA.astro` (add mailto fallback)

**Action**: Add robust contact fallbacks for users without JavaScript

---

## 9. Exact File Paths Summary

### Files to Create

```
src/config/site.ts
src/pages/offers.astro
src/components/OfferCard.astro
src/content/caseStudies/ (directory)
src/pages/case-studies.astro
src/pages/case-studies/[...slug].astro
src/components/MetricPill.astro
src/components/ResultList.astro
src/pages/speaking.astro
src/scripts/generate-media-kit.mjs
src/scripts/check-resource-review.mjs
cspell.json
cspell-dict.txt
.lycheeignore
```

### Files to Modify

```
src/components/Footer.astro
src/components/ContactCTA.astro
src/components/MainHead.astro
src/components/Nav.astro
src/pages/index.astro
src/layouts/BaseLayout.astro
src/pages/[...slug].astro
src/pages/resources.astro
src/pages/resources/all.astro
src/content/config.ts
src/content/resources/*.md (2 files)
remark-modified-time.mjs
src/pages/rss.xml.js
astro.config.mjs
public/robots.txt
package.json
.github/workflows/astro.yml
frontmatter.json (FrontMatterCMS config - add caseStudies, update resources schema)
```

### Files to Audit (Brand Consistency)

```
src/components/*.astro (all components)
src/pages/*.astro (all pages)
src/layouts/*.astro (all layouts)
```

---

## 10. Dependencies Summary

### Key Dependencies

- `astro`: ^4.15.12
- `@astrojs/react`: ^3.6.2
- `@astrojs/sitemap`: ^3.2.0
- `@astrojs/rss`: ^4.0.7
- `@thewebforge/astro-og-images`: ^3.0.0
- `react`: ^18.3.1

### Dev Dependencies

- `typescript`: ^5.6.2
- `eslint`: ^8.57.1
- `prettier`: ^3.3.3
- `@astrojs/check`: ^0.9.4
- `@frontmatter/extensibility`: ^0.0.14 (FrontMatterCMS API for custom scripts)

### Package Manager

- **pnpm** (with `pnpm-workspace.yaml`)

---

## 11. Notes

- Site uses **French** as primary language (`lang="fr"` in BaseLayout)
- Blog posts are primarily in **French** with some English content
- Current brand mix: Personal ("Etienne Deneuve") + Business ("Simplifi'ed")
- Git history needed for `remark-modified-time` plugin (ensure fetch-depth in CI)
- OpenGraph images generated dynamically via `/open-graph/[...ogimage].ts`
- Theme toggle supports dark/light mode
- Cookie consent configured for analytics (Google Analytics via Partytown)
- **FrontMatterCMS** is used for content authoring (VS Code extension):
  - Provides visual editor for blog posts
  - Manages taxonomy (tags) via `.frontmatter/database/taxonomyDb.json`
  - Custom script generates social media preview images automatically
  - Content type schemas defined in `frontmatter.json` (should match `src/content/config.ts`)

---

**Next Steps**: Proceed with TODO items in order (0 → 1 → 2 → ... → 12)
