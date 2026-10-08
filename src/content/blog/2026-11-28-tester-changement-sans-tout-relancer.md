---
title: "Tout tester à chaque changement ? Pas nécessairement."
description: "Dans un monorepo, sélectionner les suites pertinentes est un vrai problème de dépendances, pas seulement un filtre sur les répertoires modifiés."
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
  - PostgreSQL
  - Go
  - Rust
  - Testing
featured: false
draft: true
relatedProjects: []
relatedArticles:
  - 2026-11-07-ia-accelere-code-ci-doit-suivre
  - 2026-11-14-deplacer-ci-sur-mac-devenv
  - 2026-11-21-github-garde-dernier-mot-ci-locale
  - 2026-12-05-retour-experience-ci-locale-ia
  - 2026-12-12-mesurer-impact-ci-locale
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 4/6. Le début : [pourquoi nous avons commencé à déplacer les validations](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Une fois la CI en local, nous avons retrouvé un problème qu’on connaissait déjà avec les runners : il suffit d’un petit changement pour relancer beaucoup trop de choses.

Sur un repository qui contient du Go, du Vue, PostgreSQL et une partie Rust, tout vérifier après chaque modification peut devenir assez pénible.

Mais si on commence à supprimer des tests un peu au hasard pour gagner du temps, on a raté l’objectif initial.

## Un changement dans un dossier ne concerne pas forcément ce dossier

La première idée est évidente : on regarde les fichiers modifiés et on choisit la suite correspondante.

\`apps/backend/\` déclenche les tests Go. \`apps/frontend/\` déclenche les tests frontend. Le code Rust déclenche Clippy et les tests natifs.

Ça marche pour les cas simples.

Puis une modification arrive dans une bibliothèque partagée. Ou dans une migration PostgreSQL utilisée par deux applications. Ou dans le script qui détermine lui-même les tests à lancer.

Avec un filtrage uniquement basé sur les répertoires, tout ça peut passer entre les mailles.

J’ai donc préféré raisonner à partir des consommateurs du changement. Si un contrat partagé bouge, il faut vérifier les applications qui en dépendent, même si leur code n’a pas changé.

Ça donne quelque chose de ce genre :

| Modification | Ce qu’on vérifie |
| --- | --- |
| Backend Go | Statique, unitaires, intégration concernée |
| Vue / frontend | Typecheck et tests du frontend |
| Bibliothèque partagée | Consommateurs concernés, même hors du dossier modifié |
| SQL / migrations | Lint, replay, compatibilité, sqlc, intégration |
| Rust | Format, Clippy, tests applicables |
| Outillage CI | Tests du contrat CI et déclenchement conservateur |
| Documentation seule | Contrôles rapides, pas de base PostgreSQL par principe |

Ce tableau ne remplace évidemment pas les dépendances réelles du repository. C’est une manière de rendre les décisions lisibles.

## Le détail que j’avais sous-estimé : comparer avec quoi ?

Il faut identifier le diff. Et c’est souvent là que les scripts « affected » deviennent moins simples qu’ils en ont l’air.

Si la PR contient cinq commits et qu’on compare uniquement \`HEAD\` à \`HEAD~1\`, on ne voit que le dernier.

Ce qui m’intéresse, c’est le changement proposé à l’intégration. On travaille donc par rapport à la branche de base et au merge-base approprié.

~~~bash
base="$(git merge-base origin/main HEAD)"
git diff --name-only "$base" HEAD
~~~

*Exemple de principe. Dans un vrai script, il faut gérer la branche cible et l’absence de merge-base.*

Il faut notamment penser au checkout peu profond, à une branche de base pas à jour, ou à l’absence d’historique local. Si je ne sais pas calculer le diff correctement, je préfère échouer ou élargir les tests plutôt que de conclure que rien n’a changé.

C’est un choix un peu moins confortable quand on regarde uniquement la durée des contrôles. Mais un statut vert produit par un diff incomplet n’a pas beaucoup d’intérêt.

## PostgreSQL nous a obligés à aller plus loin

C’est probablement la partie où nous avons passé le plus de temps à clarifier ce qu’on voulait vraiment tester.

Au début, on vérifiait déjà la syntaxe et certaines règles DDL. Mais une migration bien écrite n’est pas forcément une migration compatible avec le système en fonctionnement.

Nous avons ajouté plusieurs vérifications : rejouer l’historique sur une base propre, vérifier le schéma réellement obtenu, contrôler sa cohérence avec les requêtes sqlc et empêcher la réécriture silencieuse de migrations déjà intégrées.

Puis il a fallu regarder l’upgrade sur données existantes.

Un \`ADD COLUMN ... NOT NULL\` mal préparé peut casser sur une base peuplée alors qu’il ne pose aucun problème dans un test qui recrée tout depuis zéro. Même chose pour un backfill, une contrainte validée trop tôt ou un index créé au mauvais moment.

Nous avons commencé à tester cette situation avec des données synthétiques représentatives.

~~~text
Base N-1 déjà peuplée
  -> nouvelles migrations
  -> vérification des contraintes et des données
  -> requêtes des versions compatibles
~~~

Il reste un autre piège avec les rolling deployments : pendant le déploiement, l’ancien et le nouveau code peuvent servir des requêtes simultanément. On ne peut pas supposer que toutes les applications basculent à la même seconde.

Ce n’est pas un sujet spécifique à la CI locale. Mais puisqu’on rapatriait ces vérifications, autant arrêter de se contenter d’un \`migrate up\` vert.

## Tout ne se valide pas au même moment

Je ne voulais pas non plus transformer le pre-push en campagne E2E complète.

Le pre-commit reste court. La validation PR-ready lance les contrôles pertinents pour l’intégration. Pour l’E2E, nous avons maintenant un statut distinct, exigé par GitHub sur les PR. Il peut être satisfait de deux façons : les parcours complets passent localement lorsque le changement touche les surfaces applicatives concernées, ou le contrôle est explicitement marqué « non requis » pour un diff qui n’en a pas besoin.

Ce deuxième cas n’est pas un E2E exécuté avec succès : c’est une décision de sélection des tests, liée elle aussi au SHA du commit. La première capture montre exactement ce cas : GitHub exige le contrôle E2E, mais l’analyse du diff a conclu qu’aucun parcours complet n’était nécessaire.

<!-- IMAGE À INTÉGRER APRÈS IMPORT DES ASSETS ANONYMISÉS :
     Fichier préparé : ci-e2e-not-required-anonymized.webp
     Alt : « Contrôle E2E exact-SHA requis sur GitHub, marqué non nécessaire pour cette modification »
     Légende : « Requis ne veut pas dire exécuté à chaque PR. Si le diff ne nécessite pas d’E2E, le statut le dit explicitement. »
     Le nom interne du contexte est masqué ; ne pas ajouter la capture originale au dépôt public.
-->

La sélection doit rester conservatrice lorsqu’on ne sait pas déterminer correctement ce qui a changé. La release garde par ailleurs ses propres critères de validation.

Les images de production et les builds d’artefacts conservent eux aussi leurs propres contrôles. Un test local sur macOS ne remplace pas la vérification du contenu d’une image Linux.

## Il faut tester les règles de sélection elles-mêmes

La partie que je trouve la moins visible est peut-être la plus importante.

Lorsqu’on ajoute un nouveau dossier ou une dépendance transversale, qui vérifie que le bon test sera choisi ?

On peut écrire des tests très simples avec des listes de fichiers fictives. Une migration doit déclencher les contrôles DB. Une bibliothèque partagée doit toucher ses consommateurs. Un changement de documentation ne devrait pas démarrer PostgreSQL.

Et si on modifie un script CI, mieux vaut relancer une validation plus large plutôt que permettre au script de s’auto-déclarer sans impact.

Pendant la migration, nous avons aussi comparé les suites locales avec les anciens jobs GitHub Actions. Ce n’était pas suffisant de voir deux statuts verts : il fallait regarder si les mêmes contrôles étaient réellement exécutés.

J’aurais préféré découvrir ce genre d’écart dans la revue du script plutôt qu’après avoir supprimé le workflow historique.

## Pas besoin d’un nouveau contrôleur pour ça

Nous aurions pu ajouter une ferme de runners, un système de cache partagé et un orchestrateur de tâches.

Il y a des contextes où ce serait pertinent. Ici, nous avions déjà Nix, devenv, des scripts versionnés et GitHub pour le merge.

J’avais surtout envie de garder quelque chose qu’un développeur puisse comprendre en lisant quelques fichiers du repository.

La sélection des tests devient alors un contrat dont on peut discuter et vérifier les exceptions. Et quand elle n’est pas sûre, elle doit pouvoir lancer davantage de contrôles.

Dans le prochain épisode, je reviens sur les détails qui ont compliqué le déploiement sur les postes, notamment le publisher GitHub. Le dernier article sera réservé aux mesures, parce qu’une validation plus agréable dans mon terminal ne suffit pas à prouver qu’on a réellement gagné du temps.

## Sources officielles

- [PostgreSQL](https://www.postgresql.org/docs/current/)
- [sqlc](https://docs.sqlc.dev/)
- [Playwright](https://playwright.dev/)
