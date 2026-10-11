# Redistribution IA — audit pages (hors Thinking)

**Branche :** `ia/site-redistribution-audit`  
**PR personnelle :** [EtienneDeneuve/etiennedeneuve.github.io#118](https://github.com/EtienneDeneuve/etiennedeneuve.github.io/pull/118)  
**Hors scope :** `/thinking` et contenus associés.  
**Ne pas confondre** avec backlog `cash-factory-backlog#118` (maillage articles).

## Principe

Une page = une question :

| Question             | Page                         |
| -------------------- | ---------------------------- |
| Orientation initiale | `/` (seule)                  |
| Qui tu es            | `/about`                     |
| Quand te solliciter  | `/work` (« Accompagnement ») |
| Ce que tu as réalisé | `/projects`                  |
| Où tu interviens     | `/speaking`                  |
| Comment te contacter | `/contact`                   |

## Lots (état)

| Lot                    | Statut               | Note                                               |
| ---------------------- | -------------------- | -------------------------------------------------- |
| 1 Nav + redirects      | Implémenté           | Start Here → `/` ; case studies hors nav           |
| 2 Work Accompagnement  | Implémenté           | Situations observables ; Omnivya secondaire        |
| 3 About + Contact      | Implémenté           | Resserrés                                          |
| 4 Projects             | Implémenté           | Featured + contributions compactes                 |
| 5 Speaking + Resources | Implémenté + corrigé | TechSpresso **retiré** (décision Étienne)          |
| 6 Media kit + 404      | Implémenté           | HTML+PDF régénérés ; CI à confirmer sur SHA finale |

Légende : _implémenté_ ≠ _vérifié en prod_. Prod live peut encore servir l’ancien footer jusqu’au merge.

## Inventaire contenu (tri)

| Élément                               | Décision         | Raison                                                     | URL                                       |
| ------------------------------------- | ---------------- | ---------------------------------------------------------- | ----------------------------------------- |
| TechSpresso (resource)                | **Retirer**      | Décision Étienne : pas d’apport clair sans épisode vérifié | `/resources/TechSpresso/` → `/resources/` |
| Livres blancs Omnivya                 | **Conserver**    | Matière produite, liens directs                            | Index `#…` ; anciennes fiches → ancres    |
| DevSecOps Stéphane Robert             | **Conserver**    | Recommandation avec liens utiles                           | Index `#DevSecOps`                        |
| Appearances 2017 (FRPSUG, MX, ITCast) | **Conserver**    | Supports / pages vérifiables, datées                       | `/speaking/#appearances`                  |
| Speaking page                         | **Conserver**    | Appearances + thèmes + kit média                           | `/speaking/`                              |
| Case studies (brouillons)             | **Hors nav**     | Aucun cas publiable                                        | Anciennes routes préservées               |
| Start Here                            | **Retirer page** | Doublon home                                               | → `/`                                     |
| Resources `/all`                      | **Fusionner**    | Doublon index                                              | → `/resources/`                           |
| Thinking                              | **Préserver**    | Hors périmètre                                             | inchangé                                  |

## Décisions remplacées

- Commentaire inline TechSpresso (rattacher à Speaking) → **REMPLACÉ** par suppression totale hors Thinking.

## Vérifications

- [x] Format Prettier + cspell TechSpresso (dict conservé pour redirects/docs historiques)
- [ ] CI verte sur SHA finale de la PR
- [x] Bande Approche : token `--home-ivory` indépendant de `--paper` (clair + sombre)
- [ ] Captures FR/EN desktop/mobile thèmes clair/sombre après merge/preview
- [x] PDF media kit régénéré avec HTML (bio CTO conseil)

## Backlog (réconciliation — hors merge auto)

| Ticket                   | Action                                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| cash-factory-backlog#117 | Mettre à jour cadrage CTO conseil (plus Diagnose/Decide/Build catalogue) |
| #104 / #116              | Relier PR perso #117 (home) livrée ; redistribution = PR perso #118      |
| #126                     | About/media kit partiels ; README GitHub + LinkedIn restent ouverts      |
| #124 / #172              | Gates QA ouvertes — ne pas cocher sur smoke seul                         |
| #102                     | #111 messaging livré — réconcilier NOW                                   |
