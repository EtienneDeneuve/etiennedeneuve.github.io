---
title: "L'IA écrit plus vite. Notre CI devait suivre."
description: "L'accélération du développement assisté par IA nous a amenés à déplacer des validations sur les postes, sans abandonner la gouvernance GitHub."
pubDate: 2026-10-09T07:30:00.000Z
language: fr
contentType: architecture-decision
pillar: platform-engineering
audience:
  - cto-cio-ciso
  - engineering-leads
  - engineers
tags:
  - AI Engineering
  - CI/CD
  - Platform Engineering
  - Developer Experience
  - GitHub
featured: false
draft: false
relatedProjects: []
relatedArticles:
  - 2026-10-16-deplacer-ci-sur-mac-devenv
  - 2026-10-23-github-garde-dernier-mot-ci-locale
  - 2026-10-30-tester-changement-sans-tout-relancer
  - 2026-11-06-retour-experience-ci-locale-ia
  - 2026-11-13-mesurer-impact-ci-locale
  - 2026-10-03-provisioning-mac-pas-probleme-mdm
  - 2026-10-24-versionner-postes-semver-nix
---

> Série **Quand l’IA accélère le code, la CI doit suivre**, 1/6. Le premier article d’un retour d’expérience sur notre façon de valider le code depuis que les agents ont changé le rythme des développements.

Il y a un truc assez curieux avec les agents IA.

On peut leur faire modifier un handler Go, l’interface Vue qui va avec et quelques tests en quelques minutes. Et derrière, on attend parfois qu’un runner réinstalle les outils pour découvrir une erreur TypeScript qu’on aurait pu voir sur le Mac.

Au début, ça ne m’avait pas spécialement dérangé. C’est comme ça que fonctionnait notre CI, elle faisait son travail. Mais à mesure qu’on a utilisé davantage d’agents, l’écart entre le temps nécessaire pour produire un changement et celui nécessaire pour obtenir un retour est devenu difficile à ignorer.

Je ne vais pas prétendre qu’un agent fait en dix minutes le travail de trois ingénieurs. Il produit des modifications rapidement, c’est déjà suffisamment différent pour nous obliger à revoir certains réflexes.

## On avait surtout mis trop de choses après le push

C’est sur un de nos projets internes que nous avons mis ce modèle en place. Le repository mélange du Go, du Vue, PostgreSQL, une partie Rust et plusieurs applications : suffisamment de cas différents pour ne pas se contenter d’un POC sur trois fichiers.

Pour le moment, ce fonctionnement est déployé sur ce projet-là. Nous avons bien l’intention de le généraliser progressivement à l’ensemble de nos repositories, mais ce n’est pas encore fait. Il faudra reprendre les contrôles de chacun, pas simplement copier des hooks d’un dépôt à l’autre.

Les workflows GitHub Actions vérifiaient les bonnes choses : tests unitaires, intégration, typecheck, migrations, contrôles Rust. Mais chaque suite embarquait aussi une partie de la préparation de l’environnement, avec son téléchargement d’outils et ses caches.

Lorsqu’on a commencé à regarder les consommations GitHub Actions, on a retrouvé des contrôles redondants et du setup répété. C’était un bon point de départ pour l’audit.

Sauf que le premier irritant n’était même pas la facture.

Prenons une erreur de type dans une modification frontend. Il faut qu’elle soit détectée, évidemment. Mais est-ce qu’on a vraiment besoin de pousser une branche et de démarrer un environnement distant pour la découvrir ?

Même question pour un test Go, une migration qui ne se rejoue pas ou un formatage Rust.

À ce stade, j’avais davantage envie de raccourcir la boucle de correction que de supprimer des jobs pour le plaisir.

## L’agent n’a pas besoin d’une CI spéciale

Je me méfie un peu des règles de qualité qu’on ajoute dans les prompts.

On peut demander à un agent de lancer tous les tests, de relire ses changements et de ne jamais déclarer une tâche terminée trop tôt. Très bien. Mais ce n’est pas un contrat suffisant.

Un agent peut oublier une commande. Un développeur aussi.

Nous avons donc gardé la validation hors de la conversation avec l’outil. Elle vit dans le repository, sous forme de scripts versionnés. Peu importe que le changement vienne d’un agent en terminal, d’un IDE, ou d’une personne qui écrit son code normalement.

L’agent peut exécuter les mêmes commandes que nous. Et s’il ne les exécute pas, les hooks et les règles d’intégration doivent continuer à jouer leur rôle.

Ça évite une situation que je n’avais vraiment pas envie de créer : un parcours rapide pour l’IA, avec quelques tests sélectionnés au hasard, et un parcours sérieux pour les autres.

## Le travail sur les Mac nous avait déjà donné une partie de la réponse

Dans [la série sur Apple Business, Entra et Nix](/thinking/2026-10-03-provisioning-mac-pas-probleme-mdm/), j’expliquais pourquoi j’avais séparé l’enrôlement, l’identité et la configuration du poste.

L’objectif était d’avoir des Macs dont on connaît les outils et l’état, sans demander à chacun de reconstituer manuellement son environnement.

Le versionnement des workstations est aussi au programme de la série Mac. J’y reviendrai dans un prochain épisode, parce que la question de ce qui est réellement installé sur le poste devient intéressante lorsqu’on lui confie une partie des validations.

Ce sont deux sujets que je n’avais pas lancés pour la CI. Mais quand nous avons voulu rapprocher les contrôles du développeur, l’environnement était déjà là.

Nix nous permettait de retrouver les dépendances attendues. devenv ajoutait les services et les commandes du projet. Il ne restait pas à inventer un runner local : il fallait surtout utiliser correctement ce qui existait.

## Ce que nous avons déplacé

Le découpage retenu est assez simple.

~~~mermaid
flowchart LR
    A[Code humain ou agent] --> B[Checks locaux]
    B --> C[Preuve liée au SHA]
    C --> D[GitHub]
    D --> E[Merge selon les règles]
~~~

Le pre-commit reste rapide. La validation PR-ready peut démarrer les services nécessaires et faire tourner les suites pertinentes. Son résultat est associé au commit exact.

GitHub conserve les règles de merge. Les builds de release, la fabrication des images et les contrôles qui ont besoin d’un environnement indépendant restent distincts.

Je ne cherchais pas à sortir GitHub de la chaîne. Je voulais arrêter de lui demander de refaire systématiquement un travail déjà reproductible sur le poste.

## Il y a quand même une limite assez importante

Un résultat de tests produit sur un Mac n’a pas les mêmes garanties qu’un résultat produit sur un runner indépendant.

Le SHA permet de savoir quel commit est censé avoir été testé. Une GitHub App permet de contrôler qui publie le statut. Aucun des deux ne prouve qu’une personne qui maîtrise entièrement son poste a honnêtement exécuté les tests.

Cette frontière de confiance fait partie du choix d’architecture. Si l’organisation doit résister à un contributeur malveillant ou à un poste compromis, elle a besoin de contrôles indépendants adaptés.

Dans notre cas, nous voulions d’abord des vérifications reproductibles, exécutées régulièrement, avec GitHub qui continue de refuser les changements dépourvus du statut attendu.

La partie difficile n’était finalement pas d’installer les outils. C’était de trouver le bon découpage entre le poste, le repository et GitHub.

C’est ce que je détaille dans le deuxième article, avec devenv, les hooks et PostgreSQL local.

## Sources officielles

- [devenv](https://devenv.sh/)
- [GitHub : rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
