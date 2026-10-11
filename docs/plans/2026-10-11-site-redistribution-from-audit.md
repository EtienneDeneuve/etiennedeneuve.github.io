# Redistribution IA — audit pages (hors Thinking)

**Branche :** `ia/site-redistribution-audit`  
**Base :** `master` @ post-#117 (home CTO conseil validée).  
**Source :** audit produit (commit d’analyse `b3d7be3` ; exécution sur master courant).  
**Hors scope :** `/thinking` et contenus associés.

## Principe

Une page = une question :

| Question | Page |
|---|---|
| Orientation initiale | `/` (seule) |
| Qui tu es | `/about` |
| Quand te solliciter | `/work` (« Accompagnement ») |
| Ce que tu as réalisé | `/projects` |
| Où tu interviens | `/speaking` |
| Comment te contacter | `/contact` |

## Lots

1. **Nav + redirects** — Start Here → `/` ; case studies hors nav ; labels ; Mentions. ✅
2. **Work** — réécriture Accompagnement (URL `/work` conservée). ✅
3. **About + Contact** — resserrer / réduire. ✅
4. **Projects** — hiérarchie fiche + index ; OS hors About. ✅
5. **Speaking + Resources** — réalisations d’abord ; `/resources/all` → `/resources`. ✅
6. **Media kit + 404** — sync CTO ; 404 court. ✅ (HTML régénéré ; PDF à régénérer si Chromium Playwright dispo)

## Règles

- FR/EN même architecture.
- Redirects 301 pour Start Here, Resources All, anciennes URLs.
- Brouillons (Scalion, case studies) restent non publiés.
- Home actuelle : ne pas défaire la composition validée.
