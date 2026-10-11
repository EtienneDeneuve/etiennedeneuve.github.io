---
title: "Migration visuelle CTO conseil — etienne.deneuve.xyz"
date: 2026-10-11
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
deepened: false
---

# Migration visuelle CTO conseil — etienne.deneuve.xyz

Living plan. Keep U-IDs stable. **Methodology** may evolve; settled product decisions below do not reopen without an explicit new arbitration.

## Goal Capsule

- **Objective:** Une seule identité visuelle CTO conseil sur le site personnel, des compositions adaptées à chaque famille de pages, un contenu éditorial modifiable via `src/config/*` et Markdown, sans toucher aux composants pour éditer le copy — funnel Étienne → qualification Omnivya préservé.
- **Means:** Faire évoluer le dépôt Astro actuel (`BaseLayout`, `*Content`, `src/config/*`, collections) depuis le working tree local ; généraliser le langage visuel (tokens, chrome) sans imposer la composition home aux pages internes ; publications obligatoires dans la composition principale de la home.
- **Authority (ordre de résolution des conflits):**
  1. Contraintes dépôt / CI / sécurité / URLs publiques
  2. **Décisions explicites les plus récentes de cette conversation** (D1–D4 et règles §3–7 ci-dessous)
  3. Implémentation locale de la home et assets utilisateur à conserver (voir _Référence locale_)
  4. Ce plan (méthodo / lots / U-IDs)
  5. `docs/branding/cto-cursor-kit/` — **référence historique de direction artistique** (couleurs, ton, portrait source) ; SPEC / `content.fr.json` / composition kit **ne sont pas** la cible finale automatique
  6. Docs stratégiques externes (`cash-factory-backlog/*`, `docs/site-strategy.md`) — consultation ; **pas de modification** hors ce dépôt ; écarts signalés en rapport
- **Stop when:** Identité CTO conseil sur les surfaces de présentation, home à composition tranchée (D2), familles migrées FR/EN existantes, contenu externalisé, contrôles ciblés + suite finale OK ou écarts préexistants documentés — sans merge ni déploiement auto.

### Référence locale (home)

| Élément                        | Valeur exacte (2026-10-11, post-arbitrage)                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branche                        | `brand/messaging-111` (tracks `origin/brand/messaging-111`)                                                                                                    |
| HEAD                           | `f81c08ad96dd3e7498fdb9e58f3f1c8320fd18fc` — `fix: spellcheck messaging audience key and EN prioritize`                                                        |
| Working tree                   | Untracked : `docs/branding/`, `docs/plans/`, `public/assets/portrait-cto-conseil.jpeg` — **pas** de diff staged sur `HomeContent`                              |
| Code home de départ            | `src/components/HomeContent.astro` + `src/pages/{index,en/index}.astro` — composition **Atelier** encore en place (point de départ, pas cible)                 |
| Cible composition home         | **D2** (session) : desktop 2 colonnes (présentation + publications) → domaines → approche compacte → footer ; mobile : présentation compacte, publications tôt |
| Assets utilisateur à conserver | `public/assets/portrait-cto-conseil.jpeg` ; kit documentaire sous `docs/branding/cto-cursor-kit/` (non importé en prod)                                        |
| Audit remote (non-cible)       | `origin/master` @ `b3d7be3` — référence d’audit seulement ; **aucun** rebase / reset / écrasement pour s’y aligner                                             |

## Product Contract

### Summary

Migrer le site personnel vers l’identité CTO conseil et la composition home tranchée en session, en externalisant le copy vers `src/config/*` + Markdown, en préservant publication / URLs / CTA différenciés, sans modifier les dépôts stratégiques externes.

### Requirements

- R1. Aucun objet de textes littéraux éditoriaux déclaré dans un composant. Alias du type `const copy = homeConfig[lang]` accepté. Markdown pour longs ; `src/config/*.ts` pour courts (nav, CTA, labels, empty states, aria éditoriaux, métadonnées).
- R2. MDX seulement si besoin réel ; pas d’install « pour la forme ». Pas de conversion massive des contenus.
- R3. Une seule enveloppe : évoluer `BaseLayout`, `Nav`, `Footer`, tokens — pas de V2 / `old|backup`.
- R4. Généraliser le **langage visuel** ; ne pas imposer composition / hauteur home aux listes, articles, ressources, détails.
- R5. Migrer pages FR **et** EN **existantes** dans les mêmes lots ; traduire UI/présentation dans les configs ; **pas** de nouvelles traductions d’articles ; pas de miroir FR sous URL EN ; empty state EN explicite si aucune publication EN.
- R6. Positionnement **CTO conseil** sur home, nav, footer, about, work, contact, bios et métadonnées pertinentes. Profondeur technique = preuve, pas prison « plateformes cloud ». Leviers organisationnels, humains et techniques distincts. Pas de promesse d’implémentation / staffing. CTA contact → helper de qualification existant quand déjà le cas ; ne pas tout basculer vers Omnivya.
- R7. Préserve URLs, redirects, `blog`+`articles`, publication, SEO FR/EN, analytics/consent, RSS/sitemap, preuves. `getAllThinkingArticles()` applique déjà `getReleasedArticles()` — pas de double filtre. Puis : filtre langue → tri → `selectHomeThinking()`. Grille home : 0–4 publications réelles, pas de placeholders.
- R8. Portrait : source autorisée `docs/branding/cto-cursor-kit/references/portrait-original.jpeg` (copie `public/assets/portrait-cto-conseil.jpeg`) — jamais le visage généré de la maquette.
- R9. Contenu exécutable home = configs `src/config/` (ex. `home.ts` pour le propre à la home seulement). Le kit JSON **n’est pas** importé par le code de production. Un contenu partagé = un seul propriétaire (pas de copie entre `site.ts` / `messaging.ts` / `home.ts` / JSON).
- R10. Après migration d’une famille : purge styles/composants morts ; `docs/design-system.md` à jour.

### Key Decisions (settled)

- KD1. Hiérarchie d’autorité : décisions de session > implémentation locale + assets utilisateur > ce plan > kit historique DA > docs externes (lecture seule). _(2026-10-11)_
- KD2. Contenu hors littéraux dans composants : config TS + Markdown. _(user)_
- KD3. Extraction de composants seulement si partagé ou simplification réelle ; sinon rester dans `HomeContent`. _(user)_
- KD4. Lots L1→L7 (L0 clos par les arbitrages ci-dessous).
- KD5 / **D1.** CTO conseil sur toutes les surfaces de présentation actuelles ; profondeur technique = preuve ; leviers org / humain / technique distincts ; pas de réécriture articles historiques ; pas d’édition hors dépôt — écarts en rapport.
- KD6 / **D2.** Publications obligatoires dans la composition principale (desktop 2 col. présentation|publications, puis domaines, approche compacte, footer). Pas de réintro Atelier proof/paths/close. Objectifs viewport 1440×900 / 1536×864 visibles ; compact 1366×768 ; scroll si besoin ; mobile publications tôt, pas de grand portrait isolé avant contenus.
- KD7 / **D3.** Header **non sticky**. TOC article peut rester sticky desktop. Pas de chantier nav persistante.
- KD8 / **D4.** FR+EN existants dans les mêmes lots ; UI traduite en config ; pas de nouvelles traductions d’articles ; empty EN explicite.

### Scope Boundaries

**In scope**

- Socle (tokens, BaseLayout, Nav non-sticky, Footer, thème, menu mobile)
- Home FR/EN selon D2
- Familles existantes : thinking, work, projects, case studies, start-here, about, speaking, contact, resources, 404
- Externalisation copy + positionnement CTO conseil dans configs de ce dépôt
- `docs/design-system.md`
- Contrôles ciblés par lot + suite finale (secrets absents = documenter)

**Out of scope**

- Merge / déploiement / sync GitHub projects
- Refonte code Omnivya (`scaling-palm-tree`)
- Modification `cash-factory-backlog/*` ou autres dépôts
- Page builder, nouveau moteur i18n, HTML dans configs, `set:html` pour contourner
- Fusion PR #93 / #103 / Renovate
- Scalion / embargos
- Réécriture éditoriale des articles historiques
- Rebase/reset vers `b3d7be3`

**Deferred to follow-up**

- Fusion progressive blog → articles (déjà documentée ailleurs)
- Alignement ultérieur des docs stratégiques externes (signalé seulement ici)

### Success Criteria

- Surfaces de présentation en CTO conseil ; home D2 ; publications visibles desktop dans la composition principale
- Aucun grand espace vertical artificiel entre blocs ; titres longs lisibles ; grille accepte contenu réel
- Pages internes sans contrainte de hauteur home
- Copy externalisé (R1/R9) ; FR/EN configs ; empty EN honnête
- Menu, thème, filtres OK après plusieurs navigations ClientRouter ; pas d’accumulation d’écouteurs
- Contenu lisible si animations non initialisées ; `prefers-reduced-motion` respecté
- Thèmes cohérents (ivoire, code, tableaux, consentement)
- Aucune mod involontaire URLs / canonicals / alternates / RSS / publication / JSON-LD
- Contrôles exécutés vs baseline ; tests ajoutés seulement pour risques non couverts
- Captures représentatives ; pas de merge/deploy auto

### Assumptions

- A1. On travaille sur `brand/messaging-111` @ `f81c08a` + untracked listés ; on **conserve** ces fichiers utilisateur.
- A2. Labels nav (Approche / Interventions / Réalisations / Notes ou équivalents CTO conseil) mappent vers ancres/routes existantes sans renommer les URLs publiques.
- A3. Destinations CTA inchangées sauf correction de bug : lecture → publication ; exploration → interne ; contact → qualification déjà validée via `omnivyaContactUrl` quand c’est le cas.

## Planning Contract

### Methodology (éditable)

1. **Audit avant code** — référence = working tree + décisions session ; kit = DA historique seulement.
2. **Lots étroits** — content → socle → home → thinking → reste → vérif.
3. **Langage ≠ layout** ; **config d’abord**.
4. **Contrôles ciblés** pendant les lots ; suite CI complète en fin de migration — pas à chaque edit.
5. **Ne pas déplacer systématiquement** les data-loads vers `src/pages` si wrappers FR/EN suffisent.
6. **CTA différenciés** — la migration visuelle ne justifie pas de tout pointer vers Omnivya.

#### Lots

| Lot    | Intent                  | Sortie                                   |
| ------ | ----------------------- | ---------------------------------------- |
| **L0** | Arbitrages D1–D4        | Clos dans ce plan (2026-10-11)           |
| **L1** | Audit                   | Tableau familles + baseline + hardcode   |
| **L2** | Externaliser copy       | Configs propriétaires uniques ; alias OK |
| **L3** | Socle visuel            | Tokens + Nav non-sticky + Footer + thème |
| **L4** | Home D2                 | Composition session ; 0–4 pubs réelles   |
| **L5** | Thinking / lecture      | Cards + détail ; helpers canoniques      |
| **L6** | Autres familles + purge | Migration + dead code                    |
| **L7** | Vérification            | Rapport + captures                       |

#### Règles de contenu

| Type                                            | Propriétaire                                | Notes                               |
| ----------------------------------------------- | ------------------------------------------- | ----------------------------------- |
| Longs                                           | Collections MD                              | Frontmatter structuré conservé      |
| Courts partagés (identité, rôle, bios, pitches) | `site.ts` / `messaging.ts` (un seul chacun) | Home **référence**, ne duplique pas |
| Courts propres à la home                        | `src/config/home.ts` si nécessaire          | Pas d’import du kit JSON en prod    |
| Nav / pages                                     | `navigation.ts`, configs page               | —                                   |
| Technique                                       | Code                                        | classes, data-*, protocoles         |

### Key Technical Decisions

- KTD1. Tokens graphiques inspirés de la DA kit (graphite / ivoire / cuivre) dans `global.css` / styles partagés ; retirer Atelier or/pierre après migration des usages. _Governs R3, R4, R10_
- KTD2. `HomeContent` orchestrateur ; extraire Hero / Scope / Approach **seulement** si partagé ou simplification réelle. Pas de composant multi-booléens. _Governs R3, KD3_
- KTD3. Home : `getAllThinkingArticles()` (déjà released) → filtre langue → tri → `selectHomeThinking()` ; pas de second `getReleasedArticles`. Afficher uniquement les pubs existantes (≤4). _Governs R7_
- KTD4. Liens articles via helpers canoniques (`getCanonicalSlug` / `getArticlePath`). Changer slug seulement si défaut concret prouvé. Préserver `data-*` filtres ; éviter liens imbriqués si carte entière cliquable. _Governs R7_
- KTD5. CTA : réutiliser destinations existantes ; `omnivyaContactUrl` seulement où déjà / pour contact. _Governs R6, A3_
- KTD6. Pas de `@astrojs/mdx` sauf besoin prouvé. _Governs R2_
- KTD7. Header non sticky (D3). _Governs KD7_
- KTD8. Kit documentaire hors runtime ; `home.ts` référence configs communes. _Governs R9_

### High-Level Technical Design

```text
[src/config/*  ←── unique owner per shared string]
[MD collections]
        │
        ▼
  pages (wrappers FR/EN ou load minimal)
        │
        ▼
  *Content orchestrators (keep)
        │
   ┌────┼────┐
   ▼    ▼    ▼
 chrome sections cards
 Nav*  (inline  ArticleCard
 Footer OK if   (API limitée)
 *non-sticky    once-only)
        │
        ▼
 BaseLayout (HTML shell, SEO, i18n, JSON-LD, analytics, consent)
```

Home (D2) :

```text
Desktop:  [ présentation | publications ≤4 ]
          [ domaines ]
          [ approche compacte ]
          [ footer ]
Mobile:   présentation compacte → publications tôt → … → footer
```

### Inventaire familles (baseline — à rafraîchir en U2)

| Famille       | Routes                    | Orchestrateur          | Source contenu                    | Travail                            |
| ------------- | ------------------------- | ---------------------- | --------------------------------- | ---------------------------------- |
| Home          | `/`, `/en/`               | `HomeContent`          | littéraux + messaging + blog-only | D2 + configs + helpers             |
| Start Here    | `/start-here/`, `/en/…`   | `StartHereContent`     | `start-here.ts`                   | CTO conseil + tokens               |
| Thinking      | `/thinking/**`, `/en/…`   | Thinking*              | collections + `thinking.ts`       | socle + cards                      |
| Article       | thinking slug + redirects | `ArticleDetailContent` | MD                                | lecture ; TOC sticky OK            |
| Work          | `/work/`, `/en/…`         | `WorkContent`          | `work.ts`                         | CTO conseil                        |
| Case studies  | `/work/case-studies/**`…  | CaseStudies*           | MD + policy                       | visuel ; empty si aucune publiable |
| Projects      | `/projects/**`            | Projects*              | collection                        | visuel                             |
| Speaking      | `/speaking/`…             | `SpeakingContent`      | `speaking.ts`                     | audit strings                      |
| About         | `/about/`…                | `AboutContent`         | `about.ts`                        | CTO conseil / bios                 |
| Contact       | `/contact/`…              | `ContactContent`       | `contact.ts`                      | CTA qualification existante        |
| Resources     | `/resources/**`           | pages                  | MD                                | strings pages                      |
| 404           | `/404`                    | page                   | inline                            | externaliser                       |
| Design system | `/design-system/`         | page                   | —                                 | doc tokens                         |
| Offers        | `/offers/`                | redirect               | —                                 | ne pas casser                      |

**Nav → destinations (inchangées en URL)**

| Label cible (UI)   | Destination                                               |
| ------------------ | --------------------------------------------------------- |
| Approche           | `/#approche` · `/en/#approche`                            |
| Interventions      | `/work/` · `/en/work/`                                    |
| Réalisations       | `/projects/` · `/en/projects/`                            |
| Notes              | `/thinking/` · `/en/thinking/`                            |
| Contact / Échanger | destination qualification existante (`omnivyaContactUrl`) |

### Settled decisions (remplace Open Decisions)

D1–D4 clos — voir KD5–KD8. Ne pas rouvrir dans l’implémentation.

### Risks

| Risque                                | Mitigation                                         |
| ------------------------------------- | -------------------------------------------------- |
| Drift docs externes (messaging cloud) | Rapport d’écarts ; pas d’édition hors dépôt        |
| Double identité Atelier + nouveau     | Purge tokens après migration                       |
| Régression URLs / publication         | Helpers canoniques ; pas de double filtre released |
| PR #93 / #103                         | Ne pas fusionner ; surveiller overlaps             |
| Objectif « home visible » vs contenu  | Scroll autorisé ; pas de coupe `overflow:hidden`   |

### Dependencies / sequencing

```text
L0 (clos) → L1 audit → L2 content → L3 socle → L4 home → L5 thinking → L6 pages → L7 verify
```

## Implementation Units

### U1. L0 — Consigenr les arbitrages D1–D4

**Goal:** Décisions session écrites dans ce plan ; plus de bloqueurs produit ouverts.
**Approach:** Mise à jour de ce document uniquement (pas d’édition `cash-factory-backlog`).
**Files:** `docs/plans/2026-10-11-cto-conseil-site-migration-plan.md`
**Test scenarios:**

- Happy: D1–D4 absents de toute liste « ouvert » ; KD5–KD8 présents.
- Edge: Appendix A ne prescrit plus « composition = kit ».
  **Status:** done 2026-10-11.

### U2. L1 — Audit figé

**Goal:** Tableau familles / hardcode / PR / baseline contrôles ; référence home locale confirmée.
**Approach:** Inspection sans modifier le code productif ; mettre à jour ce plan (inventaire) et `docs/branding/cto-cursor-kit/AUDIT.md` si utile.
**Files:** ce plan ; `docs/branding/cto-cursor-kit/AUDIT.md`
**Test expectation:** none — documentation.
**Depends on:** U1.
**Status:** done 2026-10-11 — `docs/branding/cto-cursor-kit/AUDIT.md`.

### U3. L2 — Externaliser le copy

**Goal:** Plus de littéraux éditoriaux dans composants audités ; propriétaires uniques.
**Approach:** Étendre configs existantes ; `home.ts` seulement pour le propre home, en référençant `site` / `messaging` / nav / CTA. Migrer FR+EN UI. Aligner messaging/site de **ce dépôt** sur CTO conseil (D1) sans toucher le backlog externe.
**Files:** `src/config/{home,messaging,site,navigation,…}.ts`, composants listés U2 (`HomeContent`, speaking, resources, 404, …)
**Test scenarios:**

- Happy: home FR/EN tirent copy depuis configs ; alias `homeConfig[lang]` OK.
- Edge: empty EN publications explicite.
- Integration: CTA lecture / exploration / contact inchangés en destination.
  **Depends on:** U2.
  **Status:** in progress — home/messaging/site/nav/404 faits ; about, speaking, start-here, `ecosystem.ts` restent.

### U4. L3 — Socle visuel partagé

**Goal:** Tokens + chrome ; header non sticky ; menu a11y ; thème cohérent.
**Approach:** Évoluer styles partagés / Nav / Footer / BaseLayout ; pas de chantier sticky global.
**Files:** `src/styles/global.css`, `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, `CustomStyles.astro`, `ThemeToggle.astro`, `LanguageSwitcher.astro`, `navigation.ts`
**Test scenarios:**

- Happy: nav desktop + CTA contact ; header non sticky.
- Edge: menu mobile Échap / focus ; breakpoint sans menu résiduel.
- Integration: ClientRouter multi-navigations menu/thème/langue.
  **Depends on:** U3 (copy nav) recommandé.

### U5. L4 — Home composition (D2)

**Goal:** Home session-compliant ; publications dans la composition principale.
**Approach:** Refactor `HomeContent` ; retirer proof/paths/close Atelier ; helpers KTD3 ; portrait utilisateur ; extraction composants seulement si justifiée.
**Files:** `HomeContent.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`, `src/lib/home-thinking.ts`, asset portrait
**Test scenarios:**

- Happy: desktop 2 col. présentation|pubs ; domaines ; approche ; footer ; ≤4 pubs réelles.
- Edge: 0–3 pubs → grille adaptée, pas de placeholder ; 1440×900 / 1536×864 / 1366×768 / mobile.
- Integration: liens internes + contact ; reduced-motion ; pas de hauteur imposée aux autres pages.
  **Depends on:** U4.

### U6. L5 — Thinking + lecture

**Goal:** Socle sur cards/index/détail ; filtres intact ; TOC sticky desktop OK.
**Approach:** Adapter composants ; API ArticleCard limitée ; typo lecture indépendante du H1 home.
**Files:** `ArticleCard.astro`, `ArticleDetailContent.astro`, `ArticleTableOfContents.astro`, `Thinking*.astro`, `ds/*` si besoin
**Test scenarios:**

- Happy: filtres/tri/URL OK.
- Edge: code + table + Mermaid ; scroll horizontal local.
- Integration: canonical / prev-next / traductions existantes seulement.
  **Depends on:** U4.

### U7. L6 — Autres familles + purge

**Goal:** CTO conseil + tokens sur familles restantes ; dead code retiré.
**Approach:** Famille par famille ; grep avant delete ; empty case studies si aucune publiable.
**Files:** orchestrateurs restants, resources/404, `docs/design-system.md`
**Test scenarios:**

- Happy: smoke FR+EN existants.
- Edge: drafts non publiés ; `/offers/` redirect.
  **Depends on:** U5, U6 (ordre flexible par famille après socle).

### U8. L7 — Vérification et livraison

**Goal:** Rapport vs baseline ; captures ; pas de ship auto.
**Approach:** Contrôles ciblés déjà faits + suite `ci:quality` / build / linkcheck / test / e2e / lighthouse si possible.
**Files:** rapport PR ou `docs/branding/cto-cursor-kit/DELIVERY.md`
**Test scenarios:**

- Happy: suite exécutée ; critères Success Criteria cochés.
- Edge: contrôles impossibles documentés ; case study absente → empty vérifié.
- Integration: ClientRouter ×N ; consent ; RSS/sitemap/alternates inchangés.
  **Depends on:** U7.

## Verification Contract

**Pendant les lots :** contrôles ciblés (build local, routes touchées, tests unitaires du risque).

**En fin de migration :**

1. `bun run ci:quality`
2. `bun run build` puis `linkcheck` / tests consommant `dist`
3. `bun run test`
4. `bun run test:e2e`
5. `bun run lighthouse` si env OK

Pas de `ci:deploy-prep` pour validation design.

Viewports : 1440×900, 1536×864, 1366×768, 390×844, 320 ; zoom 200%.

Contenus réels représentatifs ; si aucune case study publiable → vérifier empty + non-publication drafts.

Comparer au baseline U2. Ajouter des tests seulement pour risques concrets non couverts.

## Definition of Done

- [x] D1–D4 consignés (KD5–KD8)
- [x] L1 / U2 tableau familles à jour (`docs/branding/cto-cursor-kit/AUDIT.md`)
- [x] U3 : home/messaging/site/nav/about/ecosystem/work/start-here/speaking/404
- [x] Home D2 + tokens + Nav graphite (U4/U5)
- [x] Thinking cards slug canonique + hit area (U6 partiel)
- [x] `docs/design-system.md` à jour
- [ ] R1/R9 exhaustif + lecture article (TOC/prose) + purge Atelier CSS restante
- [ ] Familles restantes polish + U8 vérif CI complète
- [ ] U8 rapport sans affirmation non exécutée
- [ ] Écarts docs externes signalés (pas édités)
- [ ] Aucun merge/deploy automatique

## Appendix

### A. Contexte prompts (non contradictoire)

Préambule pour tout lot d’implémentation :

```text
Dépôt : etiennedeneuve.github.io
Branche / HEAD : voir « Référence locale » du plan
Plan : docs/plans/2026-10-11-cto-conseil-site-migration-plan.md
Décisions session D1–D4 primaires ; kit = DA historique seulement (pas import runtime).
b3d7be3 = audit remote, pas cible de reset/rebase.
Conserver assets utilisateur (portrait, docs/branding/).
Pièges connus :
  - home pages : getCollection("blog") seul → préférer getAllThinkingArticles() puis langue/tri/selectHomeThinking
  - getAllThinkingArticles applique déjà getReleasedArticles — pas de double filtre
  - ArticleCard : entry.id vs getCanonicalSlug — ne changer que si défaut prouvé
  - PR #93, #103 : ne pas fusionner
CTA : lecture / exploration / contact différenciés.
```

Enchaîner les lots L1→L7 du plan. La « nouvelle homepage validée » désigne la **composition D2 + working tree**, pas la SPEC kit.

### B. Écarts externes à signaler (lecture seule)

| Surface externe                                | Écart probable vs D1                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `cash-factory-backlog/messaging.md`            | Positionnement « plateformes cloud » / titre Platform Reliability Architect                     |
| `cash-factory-backlog/brand-architecture.md`   | Titre / promesse perso orientés cloud                                                           |
| `docs/site-strategy.md` (ce dépôt, historique) | Énoncé « systèmes numériques complexes » — à réconcilier en doc locale si besoin, hors articles |

### C. Liens programme

- Epics cash-factory #102–#107 (référence ; pas d’édition)
- `docs/content-migration.md`, `docs/evidence-policy.md`

### D. Changelog du plan

| Date       | Changement                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-11 | Création initiale (kit prioritaire — obsolète)                                                                                      |
| 2026-10-11 | Correction session : hiérarchie, D1–D4 clos, composition D2, config unique, CTA différenciés, validation renforcée, U1–U8 réalignés |
