# Audit L1 — migration CTO conseil (U2)

**Date** : 2026-10-11  
**Branche** : `brand/messaging-111`  
**HEAD** : `f81c08ad96dd3e7498fdb9e58f3f1c8320fd18fc`  
**Plan** : `docs/plans/2026-10-11-cto-conseil-site-migration-plan.md`

## Référence home retenue

| Élément            | Valeur                                                   |
| ------------------ | -------------------------------------------------------- |
| Code de départ     | `src/components/HomeContent.astro` (composition Atelier) |
| Cible composition  | Décisions session D2 (pas la SPEC kit)                   |
| DA historique      | ce kit (tokens / portrait) — **non importé en runtime**  |
| Assets utilisateur | `public/assets/portrait-cto-conseil.jpeg`                |
| Remote audit       | `origin/master` @ `b3d7be3` — pas une cible de reset     |

Working tree untracked : `docs/branding/`, `docs/plans/`, portrait. Aucun diff modifié sur `HomeContent` au moment de l’audit.

## Baseline contrôles

| Contrôle                | Résultat                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `bun run format:check`  | Échec : Prettier sur 3 fichiers untracked (kit AUDIT, content.fr.json, plan) — **préexistant au code productif** |
| `bun run lint`          | OK (eslint src)                                                                                                  |
| Case studies publiables | **0** (3 fichiers, tous `draft: true`)                                                                           |
| Articles `language: en` | **0** → empty state EN obligatoire                                                                               |
| Header sticky           | Déjà `position: relative` dans `Nav.astro` — D3 déjà satisfait côté chrome                                       |

## Familles → hardcode / travail

| Famille      | Routes          | Orchestrateur          | Contenu                                      | Modifications                                             |
| ------------ | --------------- | ---------------------- | -------------------------------------------- | --------------------------------------------------------- |
| Home         | `/`, `/en/`     | `HomeContent`          | `const copy` + `scope[]` tech + messaging H1 | U3 configs ; U5 composition D2 ; `getAllThinkingArticles` |
| Nav / Footer | global          | `Nav`, `Footer`        | `navigation.ts`, `site.ts`                   | U3 rôle/labels CTO ; U4 tokens                            |
| Start Here   | FR/EN           | `StartHereContent`     | config + quelques ternaires EN               | U3/U7                                                     |
| Thinking     | FR/EN           | Thinking*              | configs + littéraux « Browse/Explorer »      | U5/U6                                                     |
| Article      | FR/EN           | `ArticleDetailContent` | MD                                           | U6 lecture ; TOC sticky OK                                |
| Work         | FR/EN           | `WorkContent`          | `work.ts`                                    | U7 CTO conseil                                            |
| Case studies | FR/EN           | CaseStudies*           | MD draft                                     | U7 empty + non-publication                                |
| Projects     | FR/EN           | Projects*              | collection                                   | U7                                                        |
| Speaking     | FR/EN           | `SpeakingContent`      | `speaking.ts` + labels inline                | U3/U7                                                     |
| About        | FR/EN           | `AboutContent`         | `about.ts`                                   | U7 bios CTO conseil                                       |
| Contact      | FR/EN           | `ContactContent`       | `contact.ts`                                 | CTA existants                                             |
| Resources    | `/resources/**` | pages                  | MD + strings page                            | U7                                                        |
| 404          | `/404`          | page                   | littéraux FR                                 | U3 config                                                 |
| Offers       | `/offers/`      | redirect               | —                                            | ne pas casser                                             |

## CTA (ne pas uniformiser)

| Surface               | Destination actuelle                                  |
| --------------------- | ----------------------------------------------------- |
| Nav CTA               | `/contact/` · `/en/contact/` (`navigationConfig.cta`) |
| Home mission / kicker | `omnivyaContactUrl(...)`                              |
| Home primaire         | `/start-here/`                                        |
| Home preuve           | `/projects/`                                          |

## Pièges techniques confirmés

1. `index.astro` / `en/index.astro` : `getCollection("blog")` + `getReleasedArticles` — ne passe pas par `getAllThinkingArticles()` (qui applique déjà released + merge articles).
2. `ArticleCard` : `getArticlePath(entry.id, …)` vs `getCanonicalSlug` ailleurs — ne changer que si défaut prouvé.
3. PR ouvertes à ne pas fusionner : #93, #103 (+ Renovate).

## Visuel réutilisable vs composition

| Réutilisable (langage)                 | Spécifique home (D2)                | Ne pas réimposer                      |
| -------------------------------------- | ----------------------------------- | ------------------------------------- |
| Tokens graphite/ivoire/cuivre (DA kit) | 2 col. présentation \| publications | Hauteur / no-scroll                   |
| Typo / boutons / focus                 | Domaines + approche compacte        | Blocs Atelier proof/paths/close       |
| Nav non-sticky, footer                 | Portrait utilisateur                | Composition SPEC kit A–F telle quelle |

## Fichiers minimaux du premier lot (U3)

- `src/config/home.ts` (nouveau)
- `src/config/messaging.ts`
- `src/config/site.ts`
- `src/config/navigation.ts`
- `src/config/not-found.ts` (nouveau, 404)
- `src/components/HomeContent.astro` (alias config ; pas encore D2 layout)
- `src/pages/404.astro`

## Écarts externes (non édités)

- `cash-factory-backlog/messaging.md` et `brand-architecture.md` : encore « Platform Reliability Architect » / plateformes cloud.
- `docs/site-strategy.md` : énoncé historique systèmes complexes.
