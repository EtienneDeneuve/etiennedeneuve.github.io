---
title: "Tout tester à chaque changement ? Pas nécessairement."
description: "Go, Vue, Rust et PostgreSQL : sélectionner les validations pertinentes sans laisser de trous."
pubDate: 2026-11-28T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - CI/CD
  - AI Engineering
  - Platform Engineering
  - devenv
  - GitHub
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 4/5. Le début : [l’IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Un monorepo est plutôt pratique jusqu’au jour où modifier une seule ligne relance toutes les suites.

Avec Cursor et les agents IA, les modifications arrivent plus vite. Si la validation ne sait pas distinguer les changements, on déplace simplement le goulot de GitHub Actions vers le Mac.

Je ne voulais pas de ça non plus.

## Une surface affectée, ce n’est pas juste un répertoire

Filtrer sur `apps/nova`, `apps/admin` ou `apps/ocr` est tentant. Mais une modification dans un package partagé peut toucher deux applications. Une migration peut casser du code qui n’a pas bougé.

Nous avons donc commencé à raisonner en surfaces et en dépendances.

~~~text
Nova -> Go + frontend + PostgreSQL pertinent
Admin -> frontend + unitaires + handlers
Migration -> lint + replay + sqlc + compatibilité
OCR -> format + clippy + tests Rust
Docs seules -> pas de suite métier complète
~~~

C’est volontairement simplifié. Il faut également tenir compte des modifications de scripts CI, de toolchains et de fichiers partagés.

Le piège, c’est de croire que « affected-aware » veut dire « aucune régression possible ». Le sélecteur de tests devient lui-même une partie critique de la chaîne.

## La base de données était le meilleur contre-exemple

Une migration SQL peut passer sur une base vide et échouer avec de vraies contraintes ou des données existantes.

Nous avons donc travaillé sur la cohérence du schéma obtenu par les migrations, sa compatibilité avec sqlc, l’immutabilité de l’historique et les scénarios d’upgrade sur une base peuplée.

Pendant un rolling deployment, l’ancien code et le nouveau peuvent cohabiter. Ce n’est pas parce que la migration s’exécute que les anciens pods savent encore fonctionner.

Réduire la CI ne signifie pas retirer ces vérifications. Ça signifie les rendre reproductibles localement et les déclencher lorsque le changement les nécessite.

## Les E2E n’ont pas besoin du même rythme

Les tests Godog et Playwright sont utiles pour valider des parcours complets. Ils n’ont pas à tourner après chaque correction d’un typecheck.

Nous les avons donc séparés du gate PR-ready, avec une étape pré-release dédiée. Cette séparation n’en fait pas des tests optionnels : elle leur donne le bon moment dans la chaîne.

## Et pourquoi pas un autre orchestrateur ?

Nous aurions pu installer un cache partagé, une ferme de runners ou un nouveau contrôleur. Je n’avais pas envie d’échanger des minutes GitHub contre de la maintenance supplémentaire.

Devenv, des scripts versionnés et une sélection des contrôles explicite étaient plus proches du problème que nous voulions résoudre.

## Suite

5/5 : le bilan, les chiffres, et ce que nous n’avons pas encore entièrement réglé.

## Sources

- [PostgreSQL](https://www.postgresql.org/docs/current/)
- [sqlc](https://docs.sqlc.dev/)
- [Playwright](https://playwright.dev/)
