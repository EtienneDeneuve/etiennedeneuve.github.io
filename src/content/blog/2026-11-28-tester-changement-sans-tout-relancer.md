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

> Série **Quand l'IA accélère le code, la CI doit suivre**, 4/6. Le début : [l'IA écrit plus vite, notre CI devait suivre](/thinking/2026-11-07-ia-accelere-code-ci-doit-suivre/).

Nous avions un premier résultat intéressant : la validation se lançait sur nos postes et GitHub conservait son rôle de gate de merge.

Mais un problème assez prévisible est apparu : déplacer les tests en local ne sert pas à grand-chose si chaque modification déclenche une heure de calcul.

Et avec des agents IA qui modifient rapidement plusieurs parties du code, le risque est même d'empirer l'expérience développeur.

Je voulais donc **faire moins de calcul inutile, sans tester moins de choses importantes**.

Ce n'est pas exactement la même demande.

## Le piège du filtre par répertoire

Au début, c'est tentant d'écrire quelques conditions Bash.

Si le diff touche le backend, exécuter Go. Si le diff touche le frontend, lancer le typecheck. Si le diff touche le module Rust, exécuter sa suite.

Pour des changements isolés, ça fonctionne.

Sauf qu'un monorepo contient aussi des dépendances transversales. Une bibliothèque Go partagée peut être utilisée par plusieurs applications. Une migration PostgreSQL peut changer le comportement d'un service dont aucun fichier n'a été modifié. Une évolution du script qui sélectionne les tests doit pouvoir déclencher ses propres vérifications.

Une sélection de tests trop naïve donne une chose assez dangereuse : une validation verte qui ne signifie pas ce qu'on croit.

## Partir des conséquences plutôt que des chemins

Nous avons commencé à raisonner en surfaces affectées.

Voici un exemple représentatif, volontairement simplifié.

| Changement | Contrôles concernés |
| --- | --- |
| Backend Go | Gardes statiques, tests unitaires, intégration si nécessaire |
| Frontend | Typecheck, tests applicables, build de validation si utile |
| Bibliothèque partagée | Toutes les surfaces consommatrices pertinentes |
| Migrations PostgreSQL | DDL, replay, sqlc, compatibilité, intégration |
| Module Rust | Format, Clippy, tests natifs |
| Scripts CI ou toolchain | Contrat CI, tests de sélection et contrôles transversaux |
| Documentation seule | Contrôles rapides, pas toute la suite métier |

Le principe est simple : les fichiers modifiés constituent un signal d'entrée, pas une preuve d'indépendance.

Pour les dépendances partagées, je préfère lancer un peu trop de tests plutôt que de déclarer un changement « sans impact » sur la base d'une mauvaise règle.

## Le merge-base est une vraie dépendance

Une implémentation affected-aware compare habituellement la branche à une référence.

Mais il faut décider *laquelle*. Le dernier commit ? La branche de base ? Le merge-base entre la branche et son parent ?

Sur une PR contenant six commits, comparer uniquement avec \`HEAD~1\` peut oublier les changements des cinq premiers. Un clone peu profond peut aussi ne pas avoir l'historique nécessaire pour trouver le merge-base.

Il faut traiter explicitement ces cas. Si le point de comparaison manque, je préfère une validation plus large ou un échec explicite à un « rien n'a changé ».

C'est moins élégant sur le terminal. C'est beaucoup plus sain pour la signification du résultat.

## Les migrations ont forcé le modèle à devenir sérieux

Notre backend utilise PostgreSQL et du code généré depuis les requêtes SQL.

Faire passer un linter sur les migrations était loin d'être suffisant.

Nous avons donc ajouté des contrôles qui répondent à plusieurs questions différentes.

Est-ce que toutes les migrations se rejouent correctement sur une base vierge ? Le schéma obtenu correspond-il à celui que sqlc consomme ? Le code généré est-il toujours synchronisé ? Les anciennes migrations ont-elles été modifiées après leur intégration ?

Et surtout : que se passe-t-il lorsqu'on applique la nouvelle migration sur une base déjà peuplée ?

~~~text
Base N-1 avec données représentatives
    -> migrations candidates
    -> assertions de schéma et de données
    -> compatibilité du code ancien et nouveau
~~~

Un replay sur base vide peut réussir alors qu'une colonne \`NOT NULL\`, une contrainte ou un backfill casse en production.

Nous avons aussi dû penser aux rolling deployments. Une nouvelle version du code peut cohabiter quelques minutes avec la précédente. Si la migration rend immédiatement les anciens pods incompatibles, le problème ne vient pas de Kubernetes.

Ces tests ne sont pas tous déclenchés pour un changement de documentation, évidemment. Mais lorsqu'une migration change, ils deviennent des contrôles obligatoires.

## Les contrôles ne sont pas forcément tous bloquants au même moment

Je distingue trois niveaux.

Le pre-commit donne un feedback très rapide. La validation PR-ready couvre ce qui doit être vérifié avant une intégration. Les tests de parcours complets, avec navigateur et services, appartiennent plutôt à un gate pré-release.

La distinction évite de relancer Playwright et tous les scénarios bout en bout pour une correction d'import.

Elle ne permet pas pour autant de qualifier un E2E comme « optionnel » : il est obligatoire au bon stade, avant la livraison de la version concernée.

Je garde également les builds d'images et la publication des artefacts à part. Valider un commit et fabriquer un artefact de production sont deux propriétés distinctes.

## Tester la logique qui choisit les tests

Une fois qu'on a automatisé la sélection des suites, le sélecteur devient une pièce sensible.

Je veux pouvoir injecter des changements factices et vérifier les décisions attendues : une modification de migration déclenche les gardes DB ; une bibliothèque partagée couvre les consommateurs ; une documentation isolée ne démarre pas PostgreSQL ; un changement de script CI force une vérification plus large.

Ces tests peuvent être très simples. L'important est qu'ils existent et qu'ils échouent lorsqu'un nouveau chemin échappe à la cartographie.

Un autre garde-fou consiste à comparer temporairement la validation locale avec la CI historique avant de supprimer les jobs distants. Si les deux exécutent des suites différentes, leur résultat vert ne démontre pas l'équivalence.

C'est moins spectaculaire que d'annoncer « affected-aware ». Mais c'est ce qui permet d'en faire autre chose qu'un pari.

## Pourquoi nous n'avons pas ajouté une nouvelle infrastructure CI

J'ai envisagé l'option classique : créer des runners dédiés, un cache distant, un ordonnanceur et un service qui distribue les tâches.

Ça peut avoir du sens à une autre échelle.

Mais notre objectif était précisément de réduire l'infrastructure à exploiter. Nous avions déjà Nix, devenv, des scripts versionnés et GitHub pour la politique de merge.

Je n'avais pas envie de gagner trois minutes sur un runner en échange d'une nouvelle plateforme à maintenir.

## Suite

5/6 : **Ce que le déplacement de la CI nous a réellement appris.** On parlera des difficultés de déploiement, du poste neuf et de ce qui reste à fiabiliser.

Puis un sixième article regardera les résultats sous un autre angle : dollars, temps de feedback et expérience développeur, sans transformer des hypothèses en gains acquis.

## Sources

- [PostgreSQL : documentation](https://www.postgresql.org/docs/current/)
- [sqlc : documentation](https://docs.sqlc.dev/)
- [Playwright : documentation](https://playwright.dev/)
