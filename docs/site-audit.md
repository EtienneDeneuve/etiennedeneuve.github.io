# Audit du site — etiennedeneuve.github.io

**Date :** 2026-07-21  
**Branche inspectée :** working tree local  
**Objectif :** distinguer l’opérationnel du généré, obsolète, dupliqué, non prouvé ou incohérent avant refonte.

---

## Synthèse exécutive

| Zone                             | État                       | Risque principal                                      |
| -------------------------------- | -------------------------- | ----------------------------------------------------- |
| Blog historique (49 articles)    | Opérationnel               | URLs legacy à préserver absolument                    |
| Resources (2 entrées)            | Partiellement opérationnel | Build **cassé** sur `/resources/all`                  |
| Offers / Speaking / Case studies | Publiés mais contestables  | Contenus commerciaux non sourcés                      |
| CI / build                       | **Bloquant**               | `pnpm run build` échoue                               |
| Marque / contact                 | Incohérent                 | Omnivya en config, Simplifi’ED en booking             |
| Composants morts                 | Présents                   | SocialStats, SimplifiEdProjects, ContactCTA (partiel) |
| Docs racine                      | Partiellement faux         | ARCHITECTURE_MAP, BRAND_CONSISTENCY, CSS_AUDIT        |

**Verdict :** le cœur blog + assets historiques est solide ; la couche « trust engine / commercialisation » ajoutée récemment mélange placeholders publiés, métriques inventées et incohérences de marque. La refonte doit partir de la vérité vérifiable, pas des documents d’audit existants.

---

## 1. Carte réelle des routes

### Routes publiées (build Astro — confirmées ou partiellement confirmées)

| Route                  | Fichier source                           | Statut                 | Notes                                                      |
| ---------------------- | ---------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| `/`                    | `src/pages/index.astro`                  | ✅ Opérationnel        | Hero, Skills, 4 articles récents                           |
| `/blog/page/{1..10}`   | `src/pages/blog/page/[page].astro`       | ✅ Opérationnel        | 49 articles, 5/page → 10 pages                             |
| `/blog`                | redirect → `/blog/page/1`                | ✅                     | `astro.config.mjs`                                         |
| `/{slug}`              | `src/pages/[...slug].astro`              | ✅ Opérationnel        | **Tous** les articles blog à la racine (pas sous `/blog/`) |
| `/resources`           | `src/pages/resources.astro`              | ⚠️ Partiel             | Fonctionne si build passe                                  |
| `/resources/all`       | `src/pages/resources/all.astro`          | ❌ **Bloque le build** | Image distante DevSecOps                                   |
| `/resources/{slug}`    | `src/pages/resources/[...slug].astro`    | ⚠️                     | 2 slugs possibles                                          |
| `/offers`              | `src/pages/offers.astro`                 | ✅ Généré              | 8 offres inline (pas collection)                           |
| `/case-studies`        | `src/pages/case-studies.astro`           | ✅ Généré              | 2 faux case studies publiés                                |
| `/case-studies/{slug}` | `src/pages/case-studies/[...slug].astro` | ✅ Généré              |                                                            |
| `/speaking`            | `src/pages/speaking.astro`               | ✅ Généré              | Topics OK, past appearances vide                           |
| `/404`                 | `src/pages/404.astro`                    | ✅                     |                                                            |
| `/rss.xml`             | `src/pages/rss.xml.js`                   | ⚠️                     | Inclut tous les articles (pas de filtre draft)             |
| `/open-graph/{...}`    | `src/pages/open-graph/[...ogimage].ts`   | ✅ Généré              | ~49 images OG au build                                     |
| `/media-kit.html`      | `public/media-kit.html`                  | ✅ Statique            | Généré aussi par CI script                                 |
| `/sitemap-index.xml`   | intégration `@astrojs/sitemap`           | ⚠️                     | Non produit si build échoue                                |

### Routes utilitaires / API

- **OG images** : génération lourde au build (Playwright via `@thewebforge/astro-og-images`).
- **RSS** : lien `{siteUrl}/{post.slug}` — cohérent avec la route catch-all.

### Fichiers exclus du routage Astro (préfixe `_`)

Astro ignore les fichiers/dossiers dont le nom **commence par `_`**. Ces fichiers ne produisent **pas** de routes publiques tant qu’ils restent préfixés ainsi :

| Fichier                              | Contenu                                       | Action recommandée |
| ------------------------------------ | --------------------------------------------- | ------------------ |
| `src/pages/_blog.astro`              | Redirect vers `/blog/page/1` (doublon config) | Remove             |
| `src/pages/__about.astro`            | Page About template Astro + lorem ipsum       | Remove ou migrate  |
| `src/pages/__blog/__[...slug].astro` | Doublon route blog + ContactCTA               | Remove             |
| `src/pages/resources/__[slug].astro` | Variante resource (bug typé, obsolète)        | Remove             |

### URLs blog legacy à préserver impérativement

Les articles utilisent des slugs custom dans le frontmatter (souvent `YYYY/MM/DD/titre`) via `[...slug].astro` :

- Format majoritaire : `/2017/09/27/azure-powershell-nettoyer-les-tags`
- Quelques slugs avec slash initial : `/2017/04/27/azure-networking-tp-part-2`
- Article récent : `/2025-12-17/les-nouveaux-frameworks-web`
- Fichier sans slug custom → slug = nom de fichier (ex. `2017-02-02-agent-oms-sur-linux-dans-azure`)

**49 fichiers** dans `src/content/blog/`. Toute refonte doit conserver ces URLs ou créer des **redirects 301** explicites dans `astro.config.mjs`.

### Articles marqués `draft: true` mais potentiellement publiés

Le schéma `blog` **ne définit pas** `draft` et **aucun filtre** n’est appliqué dans `getCollection("blog")`. Ces 5 articles ont `draft: true` dans le frontmatter mais peuvent être servis :

- `2024-02-11-zero-trust-overview.md`
- `2024-02-12-zero-trust-microsoft.md`
- `2024-02-13-zero-trust-google.md`
- `2024-02-14-zero-trust-open-source.md`
- `2024-02-15-zero-trust-tl-dr.md`

---

## 2. Carte des collections de contenu

| Collection    | Fichiers | Schéma                  | Filtrage draft              | Qualité                     |
| ------------- | -------- | ----------------------- | --------------------------- | --------------------------- |
| `blog`        | 49       | `src/content/config.ts` | ❌ Aucun                    | Historique réel, fiable     |
| `resources`   | 2        | `src/content/config.ts` | N/A                         | Références externes réelles |
| `caseStudies` | 2        | `src/content/config.ts` | Champ `draft` (non utilisé) | **Faux contenu publié**     |

### Blog

- **Opérationnel** : articles 2015–2025, contenu technique authentique.
- **Problèmes** :
  - `slug` et `draft` absents du schéma Zod alors que présents dans le frontmatter.
  - Dates « Mis à jour » via git (`remark-modified-time.mjs`) — parfois incohérentes avec `pubDate` (3 warnings verify-git-dates).
  - `lastModified` optionnel non alimenté systématiquement.

### Resources

| Slug          | Titre                       | Type    | URL externe               |
| ------------- | --------------------------- | ------- | ------------------------- |
| `DevSecOps`   | DevSecOps - Stéphane Robert | link    | blog.stephane-robert.info |
| `TechSpresso` | PodCast - Techspresso       | podcast | YouTube / Apple Podcasts  |

- Contenu réel et revu (`lastReviewed: 2025-12-20`).
- **Bloqueur build** : `DevSecOps.md` → `img` pointe vers une URL dont Astro ne peut pas inférer les dimensions (`ResourcesPreview.astro` + `inferSize={true}`).

### Case studies

| Slug                                | Titre                                  | draft   | Problème                             |
| ----------------------------------- | -------------------------------------- | ------- | ------------------------------------ |
| `client-a-devsecops-transformation` | Transformation DevSecOps pour Client A | `false` | Client fictif, métriques PLACEHOLDER |
| `client-a-platform-engineering`     | Plateforme Engineering pour Client A   | `false` | Idem                                 |

**Critique :** `draft: false` + contenu entièrement générique = violation directe des règles éditoriales du site.

---

## 3. Composants réutilisables

### Utilisés en production

| Composant                     | Utilisé par                                            |
| ----------------------------- | ------------------------------------------------------ |
| `BaseLayout.astro`            | Toutes les pages via layout                            |
| `MainHead.astro`              | BaseLayout — meta, GA, fonts, ViewTransitions          |
| `Nav.astro`                   | BaseLayout — 6 liens nav                               |
| `Footer.astro`                | BaseLayout — CTA booking Omnivya                       |
| `Hero.astro`                  | index, blog, resources, offers, case-studies, speaking |
| `Grid.astro`                  | index, blog, resources, offers                         |
| `Icon.astro` + `IconPaths.ts` | Partout                                                |
| `Pill.astro`                  | index, blog, resources, offers, speaking               |
| `CallToAction.astro`          | index, resources, speaking                             |
| `BookingCTA.astro`            | Footer, speaking                                       |
| `PortfolioPreview.astro`      | index, blog pagination                                 |
| `ResourcesPreview.astro`      | resources, resources/all                               |
| `Skills.astro`                | index uniquement                                       |
| `OfferCard.astro`             | offers                                                 |
| `MetricPill.astro`            | case-studies detail                                    |
| `ResultList.astro`            | case-studies detail                                    |
| `DateTime.astro`              | PortfolioPreview (?)                                   |
| `ThemeToggle.astro`           | Nav                                                    |
| `CustomStyles.astro`          | BaseLayout — backgrounds CSS                           |
| `CustomScripts.astro`         | BaseLayout — classe `loaded`                           |

### Composants morts ou non montés

| Composant                  | État          | Détail                                                                                          |
| -------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `SocialStats.astro`        | ❌ Mort       | Jamais importé ; afficherait stats Simplifi’ED                                                  |
| `SimplifiEdProjects.astro` | ❌ Mort       | Jamais importé ; section GitHub Simplifi’ED                                                     |
| `ContactCTA.astro`         | ⚠️ Quasi-mort | Commenté dans BaseLayout + index ; utilisé seulement par `__about` et `__blog` (routes privées) |

### CTA dupliqués

| Emplacement        | Type                | Destination                                 |
| ------------------ | ------------------- | ------------------------------------------- |
| `Footer.astro`     | BookingCTA          | Outlook Simplifi’ED                         |
| `speaking.astro`   | BookingCTA + mailto | Même booking + `etienne@omnivya.fr`         |
| `ContactCTA.astro` | BookingCTA wrapper  | Idem footer                                 |
| `BookingCTA.astro` | Hardcode ligne 14   | URL Simplifi’ED **en plus** de `siteConfig` |

**Incohérence :** footer dit « travailler avec Omnivya » (`getBrandText.footerCta()`) mais le lien pointe vers `SimplifiED1@simplified.fr`.

---

## 4. Dépendances réellement utilisées

### Runtime — utilisées

| Package                                                 | Usage                                                |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `astro`                                                 | Framework                                            |
| `@astrojs/react`                                        | Intégration (aucun composant React/TSX dans le repo) |
| `@astrojs/sitemap`                                      | Sitemap                                              |
| `@astrojs/partytown`                                    | GA différé                                           |
| `@astrojs/rss`                                          | rss.xml                                              |
| `@jop-software/astro-cookieconsent`                     | Bandeau cookies FR/EN                                |
| `@thewebforge/astro-og-images`                          | OG images build-time                                 |
| `sharp`                                                 | Images (transitif OG)                                |
| `remark-toc`, `rehype-slug`, `rehype-autolink-headings` | Markdown blog                                        |
| `remark-mermaidjs`                                      | Diagrammes Mermaid dans articles                     |
| `vanilla-cookieconsent`                                 | Cookie consent (via integration)                     |
| `aos`                                                   | **Non importé** (voir ci-dessous)                    |

### Dev — utilisées en CI/scripts

| Package               | Usage                                      |
| --------------------- | ------------------------------------------ |
| `@astrojs/check`      | `astro check`                              |
| `cspell` + dicts      | spellcheck CI                              |
| `@lhci/cli`           | Lighthouse CI                              |
| `markdown-link-check` | linkcheck:markdown (script, pas CI matrix) |
| `playwright-core`     | OG image generation (via astro-og-images)  |
| `@playwright/test`    | Installé en CI pour browsers               |

### Packages probablement inutilisés

| Package                                         | Raison                                                  |
| ----------------------------------------------- | ------------------------------------------------------- |
| `react`, `react-dom`, `@types/react*`           | Aucun `.tsx`/`.jsx` ; seul `@astrojs/react` dans config |
| `aos`                                           | `src/js/aos.js` existe mais **jamais importé**          |
| `tw-to-css`                                     | Aucune référence                                        |
| `rehype-toc`                                    | Seul `remark-toc` est configuré                         |
| `html-encoder-decoder`, `html-entities`         | Aucune référence directe                                |
| `@playwright/test`                              | Installé CI mais pas de tests e2e dans le repo          |
| `scripts/social-img.mjs` → `node-html-to-image` | Package absent du package.json                          |

### JavaScript client réel

| Script                                  | Justification                                                                    |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| Nav menu (`menu-button` custom element) | Mobile nav — mesurable (a11y menu)                                               |
| Theme toggle                            | Préférence utilisateur                                                           |
| MainHead theme + MutationObserver       | Dark mode instant                                                                |
| BookingCTA fallback                     | Dégradation gracieuse (peu utile : écoute `error` sur `<a>` ne se déclenche pas) |
| ViewTransitions (Astro)                 | Navigation SPA-like                                                              |
| Partytown + GA                          | Analytics consent-based                                                          |
| AOS                                     | **Non chargé**                                                                   |

---

## 5. Éléments morts ou redondants

### Fichiers / routes

- `src/pages/_blog.astro` — redirect doublon de `astro.config.mjs`
- `src/pages/__about.astro` — template lorem ipsum
- `src/pages/__blog/__[...slug].astro` — doublon blog
- `src/pages/resources/__[slug].astro` — variante cassée
- `.github/workflows/astro.yml.backup` — workflow obsolète
- `scripts/issues.json`, `scripts/*.sh` — backlog tooling, pas lié au site
- `spell.log`, `spell2.log` — logs locaux
- `PR_DESCRIPTION.md` — doc PR ponctuelle

### Documents racine devenus faux ou partiellement faux

| Document                       | Problème                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ARCHITECTURE_MAP.md`          | Dit « pas d’offers/case studies » alors qu’ils existent ; TODO brand « non fait » alors que `site.ts` existe ; footer « Simplifi’ED » alors qu’il dit Omnivya |
| `BRAND_CONSISTENCY_SUMMARY.md` | Affirme footer CTA = Simplifi’ED ; réalité = Omnivya texte + Simplifi’ED booking ; dit « build successful » — **faux aujourd’hui**                            |
| `CSS_AUDIT_REPORT.md`          | Affirme « Build réussi sans erreurs » — **faux** ; corrections CSS peut-être appliquées mais non revalidées                                                   |
| `PR_DESCRIPTION.md`            | Bios « expert reconnu », « 15 ans » — non vérifiées                                                                                                           |

### Données générées / mises à jour par CI

| Fichier                      | Généré par                              | Commité |
| ---------------------------- | --------------------------------------- | ------- |
| `public/media-kit.html`      | `generate-media-kit.mjs`                | Oui     |
| `src/data/social-stats.json` | `fetch-social-stats.mjs`                | Oui     |
| `public/media-kit.pdf`       | Non — seulement `.pdf.note` placeholder | Non     |

### Assets publics

- **~400+ fichiers** sous `public/assets/` — images blog historiques WordPress, backgrounds, portrait, PDFs DevOps.
- `public/assets/2017/09/.FRPSUG.pptx.icloud` — placeholder iCloud, inutile en prod.
- `stock-1..4.jpg` — images génériques pour articles sans visuel.
- OG default image config : `https://etienne.deneuve.xyz/assets/portrait.jpg` — chemin servi (sans `/public/`).

---

## 6. Contenus = affirmations non prouvées

### Case studies fictifs (critique)

Les deux case studies décrivent « Client A » avec :

- Résultats chiffrés (« -65% incidents », « -70% time-to-market »)
- Métriques explicitement `[PLACEHOLDER: ...]`
- Technologies et stacks détaillés sans client réel
- `draft: false` → **publiés**

### Page Offers — métriques commerciales non sourcées

8 offres inline dans `offers.astro` avec promesses chiffrées :

- « Réduction 30-50% MTTR », « Score 8/10+ », « Réduction 20-40% coûts cloud », « 99.9%+ SLA », etc.
- Aucune source, fourchette générique, ton marketing.

### Speaking — interventions non documentées

- 6 sujets proposés (contenu éditorial acceptable comme **intentions**)
- `pastAppearances = []` — section vide avec placeholder
- Bios media kit : « expert reconnu », « plus de 15 ans d'expérience », « speaker actif » — **non sourcées**
- Pill homepage « Speaker » sans liste d’événements vérifiables

### Skills homepage

- « Industry Leader » — jargon interdit par la doctrine du site
- « Toujours à jour, j'aime partager! » — claim vide

### Social stats (composant mort mais données commitées)

`social-stats.json` contient :

- LinkedIn : 7828 followers, 500 connections — **API ou scraping, à revalider**
- YouTube : 0 partout — cohérent si chaîne inactive
- Simplifi’ED GitHub : 19 repos, 54 stars — **réel (API GitHub)** mais marque legacy

### Absence totale dans le code

Aucune mention de **Scalion AI**, **Sanad**, **My Dare** — à créer comme preuves de construction, pas comme pub.

---

## 7. Liens, emails, marques et dates incohérents

### Marques

| Contexte                                | Valeur                               | Problème                       |
| --------------------------------------- | ------------------------------------ | ------------------------------ |
| `siteConfig.business.name`              | Omnivya                              | OK entité opérationnelle       |
| `siteConfig.contact.businessEmail`      | SimplifiED1@simplified.fr            | Legacy Simplifi’ED             |
| `siteConfig.contact.businessBookingUrl` | outlook…/SimplifiED1@simplified.fr   | Legacy                         |
| Footer CTA texte                        | « …Omnivya ? »                       | Texte ≠ canal                  |
| `BookingCTA.astro` L14                  | Hardcode Simplifi’ED URL             | Contourne config partiellement |
| `fetch-social-stats.mjs`                | Org GitHub `simplifi-ed`             | Legacy, pas Omnivya            |
| Blog historique                         | Références Simplifi’ED/simplified.fr | OK dans contexte historique    |

### Emails

| Email                       | Où                                     |
| --------------------------- | -------------------------------------- |
| `etienne@omnivya.fr`        | siteConfig personal + business         |
| `SimplifiED1@simplified.fr` | booking                                |
| `etienne@simplified.fr`     | articles blog historiques (megalinter) |
| `t3chspress0@gmail.com`     | resource TechSpresso (externe)         |

### URLs

| URL                              | Problème                                        |
| -------------------------------- | ----------------------------------------------- |
| `siteConfig.site.defaultOgImage` | `/assets/portrait.jpg` (sans `/public/`)        |
| `siteConfig.business.website`    | `www.omnivya.fr` sans schéma (usage hétérogène) |
| Footer socials                   | URLs hardcodées, pas `siteConfig.social`        |
| Nav LinkedIn                     | Absent du footer (présent dans config)          |

### Dates

- **verify-git-dates** : 3 articles zero-trust — git date antérieure au pubDate affiché.
- **remark-modified-time** : affiche « Mis à jour » basé sur git pour tous les articles — peut surprendre sur contenu 2015.
- `social-stats.json` : `lastUpdated: 2025-12-20` — fraîcheur inconnue sans CI secrets.

---

## 8. SEO, accessibilité, performance, conversion

### SEO

| Élément          | État                                                           |
| ---------------- | -------------------------------------------------------------- |
| Canonical        | MainHead auto + overrides offers/speaking/case-studies/blog    |
| JSON-LD          | Person + WebSite (home), Article (blog), Service (offers)      |
| Sitemap / RSS    | Configurés                                                     |
| GA               | UA-71551100-1 (Universal Analytics — **obsolète**, migrer GA4) |
| Twitter card     | `summary_large_image`                                          |
| Meta Bing        | `msvalidate.01` présent                                        |
| hreflang         | Absent (site FR only — acceptable)                             |
| OG image default | `/assets/portrait.jpg`                                         |

### Accessibilité

| Point                           | État                                              |
| ------------------------------- | ------------------------------------------------- |
| Lang `html`                     | `fr` ✅                                           |
| Skip link                       | ❌ Absent                                         |
| Nav mobile                      | `aria-expanded`, sr-only ✅                       |
| Focus states                    | Ajoutés sur case-studies/speaking (CSS_AUDIT)     |
| `prefers-reduced-motion`        | Partiel (case-studies, speaking)                  |
| Contraste                       | Non audité automatiquement (Lighthouse CI bloqué) |
| ResourcesPreview                | `target="_blank"` sans indication explicite a11y  |
| Emojis dans BookingCTA fallback | 📧 📅 — acceptable mais perfectible               |

### Performance

| Point                   | État                                          |
| ----------------------- | --------------------------------------------- |
| ViewTransitions         | JS sur chaque navigation                      |
| OG generation           | Build très long (~50 images Playwright)       |
| Fonts Google            | Public Sans + Rubik — render-blocking partiel |
| Backgrounds             | Lazy via classe `loaded` ✅                   |
| Partytown               | GA offload ✅                                 |
| `background-blend-mode` | Coûteux sur offers/speaking/case-studies      |

### Conversion

| Point                         | Problème                        |
| ----------------------------- | ------------------------------- |
| CTA unique répété             | Footer sur **toutes** les pages |
| Offers sans CTA               | Pas de booking sur `/offers`    |
| Case studies fictifs          | Risque crédibilité              |
| `/offers` voix « Nos Offres » | Voix agence, pas personnelle    |
| Pas de page About publique    | Identité fragmentée             |

---

## 9. Risques de régression

### Critiques (P0)

1. **URLs blog legacy** — 49 slugs custom ; toute restructuration `/blog/YYYY/...` exige redirects 301 exhaustifs.
2. **Build cassé** — CI deploy potentiellement bloqué sur `/resources/all`.
3. **Case studies fictifs publiés** — risque réputationnel immédiat.

### Élevés (P1)

4. Articles `draft: true` servis si non filtrés.
5. Redirect `/blog` → `/blog/page/1` — à conserver.
6. `public/CNAME` = `etienne.deneuve.xyz` — domaine custom GitHub Pages.
7. Media kit / bios avec claims non vérifiés — copiés dans speaking + generate script.

### Moyens (P2)

8. OG images régénérées à chaque build — temps CI.
9. `social-stats.json` commité — données périmées si CI secrets absents.
10. Doublon canonical (MainHead + pages individuelles) — généralement OK mais à surveiller.

---

## 10. Matrice keep / refactor / remove / migrate

| Élément                                  | Décision                          | Justification                                              |
| ---------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| Collection `blog` (49 articles)          | **KEEP**                          | Preuve réelle, URLs legacy                                 |
| Routes `/blog/page/N` + redirect         | **KEEP**                          | Navigation existante                                       |
| Route catch-all `[...slug].astro`        | **KEEP**                          | URLs articles                                              |
| Collection `resources`                   | **KEEP**                          | Contenu réel                                               |
| `/resources/all`                         | **REFACTOR**                      | Corriger image distante ou retirer inferSize               |
| `src/config/site.ts`                     | **REFACTOR**                      | Unifier booking Omnivya, corriger OG URL                   |
| Layout BaseLayout + Nav + Footer         | **REFACTOR**                      | CTA, socials depuis config                                 |
| Composants Hero, Grid, Icon, Pill, CTA   | **KEEP**                          | Design system minimal                                      |
| `Skills.astro`                           | **REFACTOR**                      | Retirer « Industry Leader », claims vides                  |
| `offers.astro` data inline               | **MIGRATE**                       | → collection ou config + draft jusqu’à validation          |
| Case studies Client A                    | **REMOVE** ou **MIGRATE** → draft | Faux contenu ; remplacer par preuves réelles               |
| `speaking.astro` topics                  | **KEEP**                          | Intention éditoriale OK                                    |
| `speaking.astro` bios                    | **REFACTOR**                      | Retirer claims non sourcés                                 |
| `pastAppearances`                        | **KEEP** vide                     | Honnête — remplir avec données réelles                     |
| `SocialStats.astro`                      | **REMOVE** ou refactor            | Mort + legacy Simplifi’ED                                  |
| `SimplifiEdProjects.astro`               | **REMOVE**                        | Mort + mauvaise marque                                     |
| `ContactCTA.astro`                       | **REFACTOR**                      | Centraliser ou supprimer si footer suffit                  |
| `BookingCTA.astro` hardcode              | **REFACTOR**                      | Single source siteConfig                                   |
| Pages `__*` et `_blog.astro`             | **REMOVE**                        | Dead code                                                  |
| `resources/__[slug].astro`               | **REMOVE**                        | Doublon cassé                                              |
| `src/js/aos.js` + dep `aos`              | **REMOVE**                        | Non utilisé                                                |
| `@astrojs/react` + react deps            | **REMOVE**                        | Aucun composant React                                      |
| `tw-to-css`, `rehype-toc`, html-encoders | **REMOVE**                        | Non utilisés                                               |
| `ARCHITECTURE_MAP.md`                    | **REFACTOR**                      | Remplacer par ce doc + update                              |
| `BRAND_CONSISTENCY_SUMMARY.md`           | **REMOVE** ou archive             | Contient affirmations fausses                              |
| `CSS_AUDIT_REPORT.md`                    | **REMOVE** ou archive             | Build success faux                                         |
| `PR_DESCRIPTION.md`                      | **REMOVE**                        | Ponctuel                                                   |
| `.github/workflows/astro.yml.backup`     | **REMOVE**                        | Obsolète                                                   |
| `fetch-social-stats` Simplifi’ED         | **MIGRATE**                       | Vers org/profil pertinent ou retirer                       |
| `generate-media-kit.mjs`                 | **REFACTOR**                      | Bios factuelles, booking Omnivya                           |
| Scalion / Sanad / My Dare                | **MIGRATE**                       | Nouvelle collection preuves — **données réelles requises** |
| UA Google Analytics                      | **MIGRATE**                       | GA4 ou retirer                                             |
| Booking Simplifi’ED                      | **MIGRATE**                       | Calendrier Omnivya ou email unique                         |

---

## Scripts de génération et validation

| Script                      | Commande                    | Résultat audit                                           |
| --------------------------- | --------------------------- | -------------------------------------------------------- |
| `verify-seo.mjs`            | `pnpm run verify-seo`       | ✅ siteUrl OK                                            |
| `verify-git-dates.mjs`      | `pnpm run verify-git-dates` | ⚠️ 3 warnings                                            |
| `check-resource-review.mjs` | `pnpm run check-resources`  | ✅                                                       |
| `check-links.mjs`           | `pnpm run linkcheck`        | ⚠️ Extraction seulement, pas de validation HTTP complète |
| `spellcheck` (cspell)       | `pnpm run spellcheck`       | ✅ 109 fichiers, 0 issues                                |
| `generate-media-kit.mjs`    | CI build stage              | ⚠️ Bios non sourcées                                     |
| `fetch-social-stats.mjs`    | CI build stage              | ⚠️ Continue-on-error ; Simplifi’ED legacy                |
| `audit-pages.mjs`           | Manuel                      | Dépend d’un build réussi                                 |
| `astro check`               | `pnpm astro check`          | ❌ 16 erreurs TS                                         |
| `pnpm run build`            | CI                          | ❌ **Échec** resources/all                               |

### GitHub Actions (`.github/workflows/ci.yml`)

Pipeline **CI Quality Gate** :

1. Setup + Playwright browsers
2. Matrix quality : spellcheck, linkcheck, verify-seo, verify-git-dates, check-resources
3. Build : generate-media-kit → fetch-social-stats → sync-linkedin → astro build
4. Lighthouse (continue-on-error)
5. Deploy GitHub Pages (push main/master only)

**Problème :** le build échoue → deploy bloqué en l’état.

---

## Éléments nécessitant encore une donnée réelle

Avant toute publication ou refonte de la couche « preuve / commercialisation » :

- [ ] Case studies : clients anonymisés **réels** avec accord, ou retrait
- [ ] Métriques DORA / MTTR / ROI : sources ou suppression
- [ ] Interventions speaking : événements, dates, liens slides/vidéos
- [ ] Bio « 15 ans d'expérience » : confirmation ou retrait
- [ ] Claim « expert reconnu » : retrait ou source
- [ ] Offres : périmètre, pricing, disponibilité réels
- [ ] Booking : URL/email Omnivya définitifs (vs Simplifi’ED)
- [ ] Scalion AI, Sanad, My Dare : fiches preuve avec faits vérifiables
- [ ] LinkedIn/YouTube stats : politique refresh + affichage ou retrait
- [ ] Media kit PDF : pipeline ou retrait de la promesse
- [ ] Article `2025-12-17-les-nouveaux-frameworks-web.md` : statut publication
- [ ] 5 articles zero-trust `draft: true` : publier ou retirer du build

---

## Validations exécutées (2026-07-21)

| Commande                    | Résultat                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| `pnpm run build`            | ❌ Échec — `FailedToFetchRemoteImageDimensions` sur `/resources/all`     |
| `pnpm astro check`          | ❌ 16 errors (icons manquants, types resources, `_blog.astro`, OG types) |
| `pnpm run verify-seo`       | ✅                                                                       |
| `pnpm run verify-git-dates` | ⚠️ 3 warnings                                                            |
| `pnpm run check-resources`  | ✅                                                                       |
| `pnpm run linkcheck`        | ⚠️ Extraction OK, pas de crawl HTTP complet                              |
| `pnpm run spellcheck`       | ✅                                                                       |

---

## Prochaines étapes recommandées (hors scope audit)

1. Corriger le bloqueur build `/resources/all` (sans toucher au contenu public stratégique).
2. Passer case studies en `draft: true` ou les retirer de la nav — **décision éditoriale**.
3. Ajouter `draft` + filtre au schéma blog.
4. Unifier booking/contact Omnivya dans `site.ts` + retirer hardcodes.
5. Archiver ou supprimer les docs racine obsolètes.
6. Alimenter ce document à chaque sprint de refonte.

---

_Audit produit sans modification des pages publiques. Aucun commit effectué._
